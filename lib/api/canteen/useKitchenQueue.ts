'use client';

/**
 * useKitchenQueue.ts
 *
 * Strategy: LIVE — polls every 20 seconds.
 * ONLY active when the Kitchen Display System (KDS) screen is mounted.
 * Automatically stops when the browser tab goes to background.
 *
 * Hooks:
 *   useKitchenQueue()        → GET /canteen/orders/kitchen/queue (polls 20s)
 *   useUpdateOrderStatus()   → PATCH /canteen/orders/:id/status
 *
 * After status update:
 *   - Immediately invalidates ['kitchen-queue'] for instant UI feedback
 *   - Invalidates ['orders'] for cashier active-orders view
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApiClient } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type { ApiResponse, KitchenQueueItem, OrderStatus } from '@/lib/api/canteen.types';

// ─── Kitchen Queue Live Poll ──────────────────────────────────────────────────

/**
 * useKitchenQueue
 *
 * Polls the kitchen view every 20 seconds. Stops polling when:
 *   - The browser tab is hidden (refetchIntervalInBackground: false)
 *   - The KDS component unmounts (query becomes inactive)
 *
 * @example
 * // In KDS screen component:
 * const { data: queue = [], isLoading } = useKitchenQueue();
 */
export function useKitchenQueue() {
  return useQuery({
    queryKey: QUERY_KEYS.kitchenQueue(),
    queryFn: async (): Promise<KitchenQueueItem[]> => {
      const { data } = await staffApiClient.get<ApiResponse<KitchenQueueItem[]>>(
        '/canteen/orders/kitchen/queue',
      );
      return data.data;
    },

    // LIVE: always consider stale, never cache for long
    staleTime: 0,
    gcTime: 60 * 1000, // 1 minute only

    // Poll every 20 seconds
    refetchInterval: 20 * 1000,

    // CRITICAL: Stop polling when staff switches browser tab / minimizes window
    refetchIntervalInBackground: false,

    refetchOnWindowFocus: true, // Resume poll when staff returns to tab
    retry: 1,
  });
}

// ─── Update Order Status ──────────────────────────────────────────────────────

interface UpdateStatusPayload {
  id: string;
  status: OrderStatus;
}

/**
 * useUpdateOrderStatus
 *
 * Strategy: ON-ACT — fires when kitchen staff taps "Start Preparing" or "Ready".
 * After success: instantly refreshes kitchen queue and order list.
 *
 * @example
 * const { mutate: updateStatus } = useUpdateOrderStatus();
 * updateStatus({ id: order.id, status: 'PREPARING' });
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: UpdateStatusPayload) => {
      const { data } = await staffApiClient.patch<ApiResponse<{ updated: boolean }>>(
        `/canteen/orders/${id}/status`,
        { status },
      );
      return data.data;
    },
    onSuccess: () => {
      // Instantly refresh KDS — no need to wait for the 20-sec poll interval
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kitchenQueue() });
      // Refresh cashier's active order panel
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() });
    },
  });
}
