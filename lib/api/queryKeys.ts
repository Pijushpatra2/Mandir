/**
 * queryKeys.ts
 *
 * Centralized TanStack Query key registry.
 *
 * WHY: Using string literals scattered across hooks causes typo bugs
 * and makes cache invalidation error-prone. This file is the single
 * source of truth — if a key changes, it changes in ONE place.
 *
 * USAGE:
 *   import { QUERY_KEYS } from '@/lib/api/queryKeys';
 *   useQuery({ queryKey: QUERY_KEYS.menu() })
 *   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.menu() })
 */

export const QUERY_KEYS = {
  // ─── Auth ────────────────────────────────────────────────────────────────
  staffProfile: ()              => ['staff-profile'] as const,
  adminProfile: ()              => ['admin-profile'] as const,

  // ─── Menu (ONCE — 30 min staleTime) ─────────────────────────────────────
  menu: (filters?: object)      => filters ? ['menu', filters] : ['menu'] as const,

  // ─── Tables (ONCE + live poll on floor screen) ───────────────────────────
  tables: ()                    => ['tables'] as const,

  // ─── Kitchen Queue (LIVE — 20 sec poll) ─────────────────────────────────
  kitchenQueue: ()              => ['kitchen-queue'] as const,

  // ─── Orders (CACHED 5 min + invalidated by mutations) ────────────────────
  orders: (filters?: object)    => filters ? ['orders', filters] : ['orders'] as const,
  order:  (id: string)          => ['orders', id] as const,

  // ─── Customers (CACHED 5 min, enabled by searchQuery) ────────────────────
  customers: (search?: string, page?: number) =>
    search ? ['customers', search, page ?? 1] : ['customers'] as const,
  customer: (id: string)        => ['customers', id] as const,

  // ─── Bookings (CACHED 5 min — page level) ───────────────────────────────
  bookings: (date?: string)     => date ? ['bookings', date] : ['bookings'] as const,

  // ─── Inventory (CACHED 5 min — page level) ──────────────────────────────
  inventory: ()                 => ['inventory'] as const,
  lowStock:  ()                 => ['inventory', 'low-stock'] as const,

  // ─── Reports (CACHED 10 min — keyed by date range) ──────────────────────
  reportsToday:         ()                          => ['reports', 'today'] as const,
  reportsSummary:       (start: string, end: string) => ['reports', 'summary', start, end] as const,
  reportsTopCustomers:  (limit?: number)             => ['reports', 'top-customers', limit ?? 10] as const,

  // ─── Staff (ONCE — manager login, 60 min) ───────────────────────────────
  staffList: () => ['staff-list'] as const,
} as const;
