/**
 * db.ts — Dexie IndexedDB Schema
 *
 * This is the LOCAL database that runs entirely in the browser.
 * All data is stored in IndexedDB using Dexie.js.
 *
 * PURPOSE:
 *   1. Cache menu + tables on first online boot → serve instantly offline
 *   2. Store orders created while offline → sync when internet returns
 *   3. Hold a mutation queue (sync_queue) for all offline actions
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  TABLE           │  STRATEGY                           │
 * ├─────────────────────────────────────────────────────────┤
 * │  cached_menu     │  Seeded on first boot, read offline  │
 * │  cached_tables   │  Seeded on first boot, read offline  │
 * │  cached_customers│  Seeded + incremental append         │
 * │  local_orders    │  Written offline, cleared after sync │
 * │  sync_queue      │  Pending mutations to send to server │
 * │  seed_meta       │  Tracks last seed timestamp          │
 * └─────────────────────────────────────────────────────────┘
 *
 * VERSIONING:
 *   When schema changes, increment the version number and add upgrade logic.
 *   NEVER modify an existing version block — only add new ones.
 */

import Dexie, { type EntityTable } from 'dexie';
import type {
  CanteenMenuItem,
  CanteenTable,
  CanteenCustomer,
  CanteenOrder,
  CanteenOrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/lib/api/canteen.types';

// ─── Local Order ──────────────────────────────────────────────────────────────
// An order created offline before the server confirms it.
// `clientId` is a UUID generated on the client — it becomes the server `id` on sync.

export interface LocalOrder {
  clientId: string;          // UUID — client-generated, used as primary key
  token_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  table_id: string | null;
  table_name: string;
  served_by: number | null;
  subtotal: number;
  tax_amount: number;
  service_charge: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes: string | null;
  items: CanteenOrderItem[];
  createdAt: number;         // Date.now() timestamp
  synced: boolean;           // false = not yet confirmed by server
  syncError: string | null;  // last sync error message if any
}

// ─── Sync Queue Entry ─────────────────────────────────────────────────────────
// Every offline mutation (POST/PATCH/DELETE) gets an entry here.
// The sync worker reads this table and replays each action when online.

export type SyncAction =
  | 'CREATE_ORDER'
  | 'UPDATE_ORDER_STATUS'
  | 'RECORD_PAYMENT'
  | 'CREATE_CUSTOMER'
  | 'EDIT_CUSTOMER'
  | 'ADJUST_INVENTORY'
  | 'LOG_WASTE'
  | 'ADD_BOOKING'
  | 'UPDATE_BOOKING';

export type SyncStatus = 'pending' | 'syncing' | 'done' | 'failed';

export interface SyncQueueEntry {
  id?: number;               // auto-increment PK
  clientId: string;          // UUID for idempotency (server skips if already processed)
  action: SyncAction;
  payload: Record<string, unknown>;
  createdAt: number;         // Date.now()
  attempts: number;          // how many times sync was attempted
  status: SyncStatus;
  errorMessage: string | null;
}

// ─── Seed Meta ────────────────────────────────────────────────────────────────
// Tracks when each cache table was last seeded so we don't re-seed on every boot.

export interface SeedMeta {
  key: string;               // e.g. 'menu', 'tables', 'customers'
  seededAt: number;          // Date.now() — timestamp of last successful seed
  count: number;             // how many records were seeded
}

// ─── Database Class ───────────────────────────────────────────────────────────

export class CanteenDb extends Dexie {
  // Typed table declarations
  cached_menu!:      EntityTable<CanteenMenuItem,  'id'>;
  cached_tables!:    EntityTable<CanteenTable,     'id'>;
  cached_customers!: EntityTable<CanteenCustomer,  'id'>;
  local_orders!:     EntityTable<LocalOrder,       'clientId'>;
  sync_queue!:       EntityTable<SyncQueueEntry,   'id'>;
  seed_meta!:        EntityTable<SeedMeta,         'key'>;

  constructor() {
    super('CanteenPOS_DB');

    /**
     * Version 1 — Initial schema
     *
     * Index notation:
     *   ++    → auto-increment
     *   &     → unique index
     *   *     → multi-entry index (for arrays)
     *   [a+b] → compound index
     */
    this.version(1).stores({
      // ── Cached API data ──────────────────────────────────────────────────
      cached_menu:      '&id, category, variety, available, sort_order',
      cached_tables:    '&id, status, location_zone, is_active',
      cached_customers: '&id, &phone, name, customer_type, is_active',

      // ── Offline order storage ────────────────────────────────────────────
      // Primary key is clientId (UUID). Indexed by sync status and table.
      local_orders: '&clientId, synced, table_id, order_status, createdAt',

      // ── Mutation replay queue ────────────────────────────────────────────
      // ++id = auto-increment. Indexed by status for fast pending queries.
      sync_queue: '++id, &clientId, action, status, createdAt, attempts',

      // ── Seed tracking ────────────────────────────────────────────────────
      seed_meta: '&key',
    });
  }
}

// ─── Singleton Instance ───────────────────────────────────────────────────────
// Create one instance and export it — import `db` everywhere in the app.

export const db = new CanteenDb();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * getSeedAge — Returns minutes since a table was last seeded.
 * Returns Infinity if the table has never been seeded.
 */
export async function getSeedAge(key: string): Promise<number> {
  const meta = await db.seed_meta.get(key);
  if (!meta) return Infinity;
  return (Date.now() - meta.seededAt) / 1000 / 60; // minutes
}

/**
 * markSeeded — Record a successful seed event for a given table key.
 */
export async function markSeeded(key: string, count: number): Promise<void> {
  await db.seed_meta.put({ key, seededAt: Date.now(), count });
}

/**
 * getPendingSyncItems — Fetch all sync_queue entries with status 'pending'.
 * Used by the sync worker to know what to replay.
 */
export async function getPendingSyncItems(): Promise<SyncQueueEntry[]> {
  return db.sync_queue
    .where('status')
    .equals('pending')
    .sortBy('createdAt');
}

/**
 * addToSyncQueue — Push a new mutation to the offline replay queue.
 * Generates a clientId using crypto.randomUUID() for idempotency.
 */
export async function addToSyncQueue(
  action: SyncAction,
  payload: Record<string, unknown>,
  clientId?: string,
): Promise<number> {
  const id = await db.sync_queue.add({
    clientId: clientId ?? crypto.randomUUID(),
    action,
    payload,
    createdAt: Date.now(),
    attempts: 0,
    status: 'pending',
    errorMessage: null,
  });
  return id as number;
}

/**
 * clearSyncedItems — Remove all done entries from the sync_queue.
 * Called after a successful bulk sync to keep the queue clean.
 */
export async function clearSyncedItems(): Promise<void> {
  await db.sync_queue.where('status').equals('done').delete();
  // Also clear synced local orders
  await db.local_orders.where('synced').equals(1).delete();
}
