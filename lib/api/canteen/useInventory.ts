'use client';

/**
 * useInventory.ts
 *
 * Strategy: CACHED 5-min — fetched when the inventory page opens.
 * Mutations invalidate inventory and low-stock.
 *
 * Hooks:
 *   useInventory()          → GET /canteen/inventory (CACHED 5 min)
 *   useLowStock()           → GET /canteen/inventory/low-stock (CACHED 5 min)
 *   useAdjustInventory()    → POST /canteen/inventory/:id/adjust
 *   useLogWaste()           → POST /canteen/inventory/waste
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApiClient } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type {
  ApiResponse,
  CanteenInventoryItem,
  LowStockItem,
} from '@/lib/api/canteen.types';

type InventoryTxType = 'RESTOCK' | 'USAGE' | 'WASTE' | 'ADJUSTMENT';


// ─── Fetch Inventory ──────────────────────────────────────────────────────────

/**
 * useInventory
 *
 * @example
 * const { data: items = [], isLoading } = useInventory();
 */
export function useInventory() {
  return useQuery({
    queryKey: QUERY_KEYS.inventory(),
    queryFn: async (): Promise<CanteenInventoryItem[]> => {
      const { data } = await staffApiClient.get<ApiResponse<CanteenInventoryItem[]>>(
        '/canteen/inventory',
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ─── Fetch Low Stock ──────────────────────────────────────────────────────────

/**
 * useLowStock
 *
 * Fetches items below their minimum stock threshold.
 * Typically shown as an alert badge on the inventory page.
 *
 * @example
 * const { data: alerts = [] } = useLowStock();
 */
export function useLowStock() {
  return useQuery({
    queryKey: QUERY_KEYS.lowStock(),
    queryFn: async (): Promise<LowStockItem[]> => {
      const { data } = await staffApiClient.get<ApiResponse<LowStockItem[]>>(
        '/canteen/inventory/low-stock',
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ─── Adjust Inventory ─────────────────────────────────────────────────────────

interface AdjustInventoryPayload {
  id: string;
  quantity: number;
  tx_type: InventoryTxType;
  notes?: string;
}

/**
 * useAdjustInventory
 *
 * Strategy: ON-ACT — fires on kitchen/manager stock adjustment.
 * After success: invalidates inventory + low-stock.
 *
 * @example
 * const { mutate: adjust } = useAdjustInventory();
 * adjust({ id: itemId, quantity: 10, tx_type: 'RESTOCK' });
 */
export function useAdjustInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: AdjustInventoryPayload) => {
      const { data } = await staffApiClient.post<ApiResponse<{ adjusted: boolean }>>(
        `/canteen/inventory/${id}/adjust`,
        body,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lowStock() });
    },
    retry: false,
  });
}

// ─── Log Waste ────────────────────────────────────────────────────────────────

interface WasteLogPayload {
  inventory_id: string;
  quantity: number;
  reason?: string;
  estimated_cost?: number;
}

/**
 * useLogWaste
 *
 * Strategy: ON-ACT — fires when kitchen logs a waste entry.
 * After success: invalidates inventory + low-stock.
 */
export function useLogWaste() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: WasteLogPayload) => {
      const { data } = await staffApiClient.post<ApiResponse<{ logged: boolean }>>(
        '/canteen/inventory/waste',
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lowStock() });
    },
    retry: false,
  });
}
