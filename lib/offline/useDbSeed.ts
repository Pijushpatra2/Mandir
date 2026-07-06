'use client';

/**
 * useDbSeed.ts
 *
 * Seeds the local Dexie IndexedDB from the API on the first online boot.
 *
 * SEEDING RULES:
 *   - Only seeds when online.
 *   - Skips seeding if data was seeded within the last 30 minutes.
 *   - Runs silently in the background — does NOT block the UI.
 *   - Uses bulk insert (Dexie bulkPut) for maximum performance.
 *   - Tracks seed state in the `seed_meta` table.
 *
 * WHAT IS SEEDED:
 *   - cached_menu     → Full menu catalog (serves offline POS grid)
 *   - cached_tables   → Full table list (serves offline seating grid)
 *   - cached_customers→ First page of customers (serves offline customer lookup)
 *
 * WHEN THIS HOOK RUNS:
 *   Mounted inside the canteenPOS layout. Triggers automatically when
 *   the POS app boots online. Re-seeds if data is older than 30 minutes.
 *
 * USAGE:
 *   // In canteenPOS/layout.tsx
 *   useDbSeed(); // No arguments needed
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { staffApiClient } from '@/lib/apiClient';
import { db, getSeedAge, markSeeded } from '@/lib/offline/db';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type { ApiResponse, CanteenMenuItem, CanteenTable, PaginatedResult, CanteenCustomer } from '@/lib/api/canteen.types';

// Re-seed if cached data is older than 30 minutes
const SEED_TTL_MINUTES = 30;

export function useDbSeed() {
  const queryClient = useQueryClient();
  const isSeeding = useRef(false); // prevent double-seed on strict mode double-effect

  useEffect(() => {
    // Only run client-side and only when online
    if (typeof window === 'undefined' || !navigator.onLine) return;
    if (isSeeding.current) return;

    // Guard: Only seed database if canteen staff is authenticated
    const token = localStorage.getItem('canteen_staff_access_token');
    if (!token) return;

    isSeeding.current = true;
    seedDatabase(queryClient).finally(() => {
      isSeeding.current = false;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─── Core Seed Logic ──────────────────────────────────────────────────────────

async function seedDatabase(queryClient: ReturnType<typeof useQueryClient>) {
  try {
    await Promise.all([
      seedMenu(queryClient),
      seedTables(queryClient),
      seedCustomers(),
    ]);
  } catch (err) {
    // Seeding failure is non-fatal — app still works with API when online
    console.warn('[DbSeed] Background seed failed (non-fatal):', err);
  }
}

// ─── Seed Menu ────────────────────────────────────────────────────────────────

async function seedMenu(queryClient: ReturnType<typeof useQueryClient>) {
  const ageMinutes = await getSeedAge('menu');
  if (ageMinutes < SEED_TTL_MINUTES) {
    // Cache is fresh — skip API call
    return;
  }

  const { data } = await staffApiClient.get<ApiResponse<CanteenMenuItem[]>>(
    '/canteen/menu',
  );
  const items = data.data;

  // Bulk upsert into IndexedDB (replaces stale items)
  await db.cached_menu.bulkPut(items);
  await markSeeded('menu', items.length);

  // Also update TanStack Query cache so the UI updates immediately
  queryClient.setQueryData(QUERY_KEYS.menu(), items);

  console.info(`[DbSeed] Seeded ${items.length} menu items into IndexedDB.`);
}

// ─── Seed Tables ──────────────────────────────────────────────────────────────

async function seedTables(queryClient: ReturnType<typeof useQueryClient>) {
  const ageMinutes = await getSeedAge('tables');
  if (ageMinutes < SEED_TTL_MINUTES) {
    return;
  }

  const { data } = await staffApiClient.get<ApiResponse<CanteenTable[]>>(
    '/canteen/tables',
  );
  const tables = data.data;

  await db.cached_tables.bulkPut(tables);
  await markSeeded('tables', tables.length);

  // Push to TanStack Query cache too
  queryClient.setQueryData(QUERY_KEYS.tables(), tables);

  console.info(`[DbSeed] Seeded ${tables.length} tables into IndexedDB.`);
}

// ─── Seed Customers ───────────────────────────────────────────────────────────

async function seedCustomers() {
  const ageMinutes = await getSeedAge('customers');
  if (ageMinutes < SEED_TTL_MINUTES) {
    return;
  }

  // Only seed the first 100 customers — keep IndexedDB lean
  const { data } = await staffApiClient.get<{
    success: boolean;
    message: string;
    data: CanteenCustomer[];
  }>(
    '/canteen/customers',
    { params: { page: 1, limit: 100 } },
  );
  const customers = data.data;

  await db.cached_customers.bulkPut(customers);
  await markSeeded('customers', customers.length);

  console.info(`[DbSeed] Seeded ${customers.length} customers into IndexedDB.`);
}
