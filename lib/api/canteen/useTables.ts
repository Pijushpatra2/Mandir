'use client';

/**
 * useTables.ts
 *
 * Strategy:
 *   - Normal:     ONCE — 30-min staleTime for layout/seating grid
 *   - Floor Plan: LIVE — pass `live: true` to enable 30-sec background poll
 *
 * Hooks:
 *   useTables()          → GET /canteen/tables
 *   useUpdateTable()     → PATCH /canteen/tables/:id (status / name / capacity)
 *   useAddTable()        → POST /canteen/tables (manager only)
 *
 * Cache invalidation:
 *   - After any mutation → ['tables']
 *   - After placeOrder success → ['tables']
 *   - After recordPayment success → ['tables']
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveClient } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type { ApiResponse, CanteenTable, TableStatus } from '@/lib/api/canteen.types';

// ─── Fetch Tables ─────────────────────────────────────────────────────────────

/**
 * useTables
 *
 * @param live  - Set true on the Floor Plan screen to enable 30-sec live poll.
 *                All other screens use the 30-min cached version.
 *
 * @example
 * // POS seating grid — uses cache, no poll
 * const { data: tables = [] } = useTables();
 *
 * // Floor plan live view — polls every 30 seconds
 * const { data: tables = [] } = useTables({ live: true });
 */
export function useTables(params?: { live?: boolean }, options?: { enabled?: boolean }) {
  const isLive = params?.live ?? false;

  return useQuery({
    queryKey: QUERY_KEYS.tables(),
    queryFn: async (): Promise<CanteenTable[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<CanteenTable[]>>(
        '/canteen/tables',
      );
      return data.data;
    },

    // ONCE: 30-min stale for normal screens
    staleTime: isLive ? 0 : 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,

    // LIVE: poll every 30 seconds on floor plan screen only
    refetchInterval: isLive ? 30 * 1000 : false,

    // CRITICAL: Stop polling when staff switches to another browser tab
    refetchIntervalInBackground: false,

    refetchOnWindowFocus: false,
    retry: 1,

    ...options,
  });
}

// ─── Update Table ─────────────────────────────────────────────────────────────

interface UpdateTablePayload {
  id: string;
  updates: {
    name?: string;
    capacity?: number;
    status?: TableStatus;
    location_zone?: string;
  };
}

/**
 * useUpdateTable
 *
 * Strategy: ON-ACT — fires on manager action (status change, rename).
 * After success: invalidates ['tables'] cache only.
 */
export function useUpdateTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: UpdateTablePayload) => {
      const client = getActiveClient();
      const { data } = await client.patch<ApiResponse<CanteenTable>>(
        `/canteen/tables/${id}`,
        updates,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables() });
    },
  });
}

// ─── Add Table ────────────────────────────────────────────────────────────────

interface AddTablePayload {
  name: string;
  capacity: number;
  location_zone?: string;
}

/**
 * useAddTable
 *
 * Strategy: ON-ACT — fires on manager form submit.
 * After success: invalidates ['tables'] cache only.
 */
export function useAddTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddTablePayload) => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<CanteenTable>>(
        '/canteen/tables',
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables() });
    },
  });
}
