'use client';

/**
 * useMenu.ts
 *
 * Strategy: ONCE — called once on POS app boot. Cached 30 minutes.
 * Tab switching, reconnect, and page reloads do NOT trigger a refetch.
 *
 * Hooks:
 *   useMenu()         → GET /canteen/menu  (full list, all categories)
 *   useAddMenuItem()  → POST /canteen/menu  (manager only)
 *   useEditMenuItem() → PATCH /canteen/menu/:id
 *   useDeleteMenuItem() → DELETE /canteen/menu/:id
 *
 * Cache invalidation:
 *   Any mutation (add/edit/delete) invalidates ONLY the ['menu'] key.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApiClient } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type { ApiResponse, CanteenMenuItem, MenuCategory, MenuVariety } from '@/lib/api/canteen.types';

// ─── Fetch All Menu Items ─────────────────────────────────────────────────────

/**
 * useMenu
 *
 * @example
 * const { data: menu = [], isLoading } = useMenu();
 */
export function useMenu(
  filters?: { category?: MenuCategory; variety?: MenuVariety; available?: 0 | 1 },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: QUERY_KEYS.menu(filters),
    queryFn: async (): Promise<CanteenMenuItem[]> => {
      const { data } = await staffApiClient.get<ApiResponse<CanteenMenuItem[]>>(
        '/canteen/menu',
        { params: filters },
      );
      return data.data;
    },

    // ONCE strategy — fresh for 30 minutes
    staleTime: 30 * 60 * 1000,
    gcTime:    60 * 60 * 1000,

    // NEVER refetch on tab focus or window switch
    refetchOnWindowFocus: false,

    // DO NOT refetch on internet reconnect — menu doesn't change often
    refetchOnReconnect: false,

    // Only retry once — if server is down, don't hammer it
    retry: 1,

    ...options,
  });
}

// ─── Add Menu Item ────────────────────────────────────────────────────────────

interface AddMenuItemPayload {
  name: string;
  price: number;
  category: MenuCategory;
  variety: MenuVariety;
  description?: string;
  image_url?: string;
  available?: boolean;
  sort_order?: number;
}

/**
 * useAddMenuItem
 *
 * Strategy: ON-ACT — fires only on manager form submit.
 * After success: invalidates ['menu'] cache so the grid refreshes once.
 */
export function useAddMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddMenuItemPayload) => {
      const { data } = await staffApiClient.post<ApiResponse<CanteenMenuItem>>(
        '/canteen/menu',
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.menu() });
    },
  });
}

// ─── Edit Menu Item ───────────────────────────────────────────────────────────

interface EditMenuItemPayload {
  id: string;
  updates: Partial<AddMenuItemPayload>;
}

/**
 * useEditMenuItem
 *
 * After success: invalidates ['menu'] cache.
 */
export function useEditMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: EditMenuItemPayload) => {
      const { data } = await staffApiClient.patch<ApiResponse<CanteenMenuItem>>(
        `/canteen/menu/${id}`,
        updates,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.menu() });
    },
  });
}

// ─── Delete Menu Item ─────────────────────────────────────────────────────────

/**
 * useDeleteMenuItem
 *
 * After success: invalidates ['menu'] cache.
 */
export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await staffApiClient.delete(`/canteen/menu/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.menu() });
    },
  });
}
