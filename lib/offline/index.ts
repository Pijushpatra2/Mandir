/**
 * index.ts — Barrel file for all offline utilities
 *
 * Import everything from one path:
 *   import { db, useOfflineStatus, useOfflineMenu, useOfflineOrder } from '@/lib/offline';
 */

// ─── Database ─────────────────────────────────────────────────────────────────
export { db, addToSyncQueue, getPendingSyncItems, clearSyncedItems, getSeedAge, markSeeded } from './db';
export type { LocalOrder, SyncQueueEntry, SyncAction, SyncStatus, SeedMeta } from './db';

// ─── Offline Status Context ───────────────────────────────────────────────────
export { OfflineProvider, useOfflineStatus } from './OfflineContext';

// ─── Seeding ──────────────────────────────────────────────────────────────────
export { useDbSeed } from './useDbSeed';

// ─── Offline-aware data hooks ─────────────────────────────────────────────────
export { useOfflineMenu, useOfflineTables, useOfflineCustomerSearch } from './useOfflineData';

// ─── Offline Queue Sync Worker ────────────────────────────────────────────────
export { useSyncQueue } from './useSyncQueue';

// ─── Offline-first mutations ──────────────────────────────────────────────────
export { useOfflineOrder, useLocalOrders } from './useOfflineOrder';
