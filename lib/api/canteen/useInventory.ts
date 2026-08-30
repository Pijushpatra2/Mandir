'use client';

/**
 * useInventory.ts
 *
 * Real-time CRUD and stock management hooks for Canteen Inventory & Stock Ledger.
 *
 * Hooks:
 *   useInventory()              → GET /canteen/inventory
 *   useLowStock()               → GET /canteen/inventory/low-stock
 *   useCreateInventoryItem()    → POST /canteen/inventory
 *   useUpdateInventoryItem()    → PATCH /canteen/inventory/:id
 *   useDeleteInventoryItem()    → DELETE /canteen/inventory/:id
 *   useAddInventoryToMenu()     → POST /canteen/inventory/:id/add-to-menu
 *   useAdjustInventory()        → POST /canteen/inventory/:id/adjust
 *   useLogWaste()               → POST /canteen/inventory/waste
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveClient } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type {
  ApiResponse,
  CanteenInventoryItem,
  LowStockItem,
} from '@/lib/api/canteen.types';

export type { ApiResponse, CanteenInventoryItem, LowStockItem };
export type InventoryTxType = 'RESTOCK' | 'USAGE' | 'WASTE' | 'ADJUSTMENT';

// ─── Fetch Inventory ──────────────────────────────────────────────────────────

export function useInventory() {
  return useQuery({
    queryKey: QUERY_KEYS.inventory(),
    queryFn: async (): Promise<CanteenInventoryItem[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<CanteenInventoryItem[]>>(
        '/canteen/inventory',
      );
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ─── Fetch Low Stock Alerts ───────────────────────────────────────────────────

export function useLowStock() {
  return useQuery({
    queryKey: QUERY_KEYS.lowStock(),
    queryFn: async (): Promise<LowStockItem[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<LowStockItem[]>>(
        '/canteen/inventory/low-stock',
      );
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ─── Create Inventory Item ────────────────────────────────────────────────────

export interface CreateInventoryPayload {
  name: string;
  category: 'Grains' | 'Dairy' | 'Spices' | 'Beverages' | 'Vegetables' | 'Other' | 'Prasad' | 'Snacks';
  stock: number;
  unit: string;
  minStock: number;
  supplierId?: string | null;
  unitCost?: number | null;
  addToMenu?: boolean;
  menuPrice?: number;
  menuCategory?: string;
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateInventoryPayload) => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<{ id: string }>>(
        '/canteen/inventory',
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lowStock() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.menu() });
    },
  });
}

// ─── Update Inventory Item ────────────────────────────────────────────────────

export interface UpdateInventoryPayload {
  id: string;
  updates: {
    name?: string;
    category?: 'Grains' | 'Dairy' | 'Spices' | 'Beverages' | 'Vegetables' | 'Other' | 'Prasad' | 'Snacks';
    stock?: number;
    unit?: string;
    minStock?: number;
    supplierId?: string | null;
    unitCost?: number | null;
  };
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: UpdateInventoryPayload) => {
      const client = getActiveClient();
      const { data } = await client.patch<ApiResponse<null>>(
        `/canteen/inventory/${id}`,
        updates,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lowStock() });
    },
  });
}

// ─── Delete Inventory Item ────────────────────────────────────────────────────

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const client = getActiveClient();
      const { data } = await client.delete<ApiResponse<null>>(
        `/canteen/inventory/${id}`,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lowStock() });
    },
  });
}

// ─── Add Inventory Item to Canteen Menu ───────────────────────────────────────

export interface AddToMenuPayload {
  inventoryId: string;
  price: number;
  category?: string;
  variety?: 'Regular' | 'Jain' | 'Spicy' | 'Sweet';
  description?: string;
  imageUrl?: string;
}

export function useAddInventoryToMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ inventoryId, ...payload }: AddToMenuPayload) => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<{ menuItemId: string }>>(
        `/canteen/inventory/${inventoryId}/add-to-menu`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.menu() });
    },
  });
}

// ─── Adjust Stock (RESTOCK, USAGE, ADJUSTMENT) ─────────────────────────────────

interface AdjustInventoryPayload {
  id: string;
  quantity: number;
  tx_type: InventoryTxType;
  notes?: string;
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: AdjustInventoryPayload) => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<{ adjusted: boolean }>>(
        `/canteen/inventory/${id}/adjust`,
        {
          type: body.tx_type,
          quantity: body.quantity,
          note: body.notes,
        },
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
  inventory_id?: string | null;
  itemName: string;
  quantity: number;
  unit: string;
  estimated_cost: number;
  reason: string;
}

export function useLogWaste() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: WasteLogPayload) => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<{ logged: boolean }>>(
        '/canteen/inventory/waste',
        {
          inventoryId: payload.inventory_id || null,
          itemName: payload.itemName,
          quantity: payload.quantity,
          unit: payload.unit,
          estimatedCost: payload.estimated_cost,
          reason: payload.reason,
        },
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
