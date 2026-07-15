'use client';

/**
 * useOrders.ts
 *
 * Strategy: CACHED 5-min + ON-ACT mutations.
 * Orders are fetched when the orders page or cashier view opens.
 * Mutations invalidate orders, tables, and kitchen-queue in sequence.
 *
 * Hooks:
 *   useOrders()          → GET /canteen/orders (filtered, CACHED 5 min)
 *   usePlaceOrder()      → POST /canteen/orders
 *   useRecordPayment()   → PATCH /canteen/orders/:id/payment
 *   useCancelOrder()     → DELETE /canteen/orders/:id
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveClient } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type {
  ApiResponse,
  CanteenOrder,
  CanteenOrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/lib/api/canteen.types';

// ─── Filter type ──────────────────────────────────────────────────────────────

interface OrderFilters {
  status?: OrderStatus;
  table_id?: string;
  date?: string;        // YYYY-MM-DD
}

// ─── Fetch Orders ─────────────────────────────────────────────────────────────

/**
 * useOrders
 *
 * Strategy: CACHED 5-min. Called when cashier panel or orders page opens.
 * Tab switching does NOT trigger refetch.
 *
 * @example
 * const { data: orders = [], isLoading } = useOrders({ status: 'NEW' });
 */
export function useOrders(filters?: OrderFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.orders(filters),
    queryFn: async (): Promise<CanteenOrder[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<CanteenOrder[]>>(
        '/canteen/orders',
        { params: filters },
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
}

// ─── Place Order ──────────────────────────────────────────────────────────────

interface PlaceOrderPayload {
  customer_name: string;
  customer_id?: string | null;
  customer_phone?: string | null;
  table_id?: string | null;
  table_name: string;
  items: Omit<CanteenOrderItem, 'id' | 'order_id'>[];
  payment_method?: PaymentMethod;
  notes?: string;
  discount_amount?: number;
}

/**
 * usePlaceOrder
 *
 * Strategy: ON-ACT — fires when cashier taps "Place Order".
 * After success invalidates: orders, tables, kitchen-queue.
 * If offline: caller should save to Dexie sync_queue instead (Phase 3).
 *
 * @example
 * const { mutate: placeOrder, isPending } = usePlaceOrder();
 * placeOrder(orderPayload, { onSuccess: () => setCart([]) });
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PlaceOrderPayload) => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<CanteenOrder>>(
        '/canteen/orders',
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      // Refresh affected data — DO NOT invalidate menu or customers here
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kitchenQueue() });
    },
    retry: false, // Never auto-retry order placement (prevent duplicate orders)
  });
}

// ─── Record Payment ───────────────────────────────────────────────────────────

interface RecordPaymentPayload {
  id: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
}

/**
 * useRecordPayment
 *
 * Strategy: ON-ACT — fires when cashier taps "Mark Paid".
 * After success invalidates: orders, tables, today's report.
 *
 * @example
 * const { mutate: recordPayment } = useRecordPayment();
 * recordPayment({ id: orderId, payment_method: 'CASH', payment_status: 'PAID' });
 */
export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payment }: RecordPaymentPayload) => {
      const client = getActiveClient();
      const { data } = await client.patch<ApiResponse<{ updated: boolean }>>(
        `/canteen/orders/${id}/payment`,
        payment,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reportsToday() });
    },
    retry: false,
  });
}

// ─── Cancel Order ─────────────────────────────────────────────────────────────

/**
 * useCancelOrder
 *
 * Strategy: ON-ACT — fires when manager cancels an order.
 * After success invalidates: orders, tables, kitchen-queue.
 *
 * @example
 * const { mutate: cancelOrder } = useCancelOrder();
 * cancelOrder(orderId);
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const client = getActiveClient();
      await client.delete(`/canteen/orders/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kitchenQueue() });
    },
    retry: false,
  });
}
