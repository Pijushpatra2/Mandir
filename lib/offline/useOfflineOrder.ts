'use client';

/**
 * useOfflineOrder.ts
 *
 * Offline-first order placement.
 *
 * WHEN ONLINE:
 *   → Calls POST /canteen/orders via staffApiClient (normal flow)
 *   → Invalidates tables, kitchen-queue, orders on success
 *
 * WHEN OFFLINE:
 *   → Saves full order to Dexie `local_orders` with synced: false
 *   → Adds a CREATE_ORDER entry to `sync_queue` for later replay
 *   → Returns a local UUID as the order ID (the server gets this on sync)
 *   → Updates the cached_tables status to OCCUPIED immediately
 *
 * USAGE:
 *   const { placeOrder, isPending, isOffline } = useOfflineOrder();
 *
 *   placeOrder(orderPayload);
 *   // Works identically online and offline from the caller's perspective
 */

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOfflineStatus } from '@/lib/offline/OfflineContext';
import { db, addToSyncQueue } from '@/lib/offline/db';
import { staffApiClient } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type {
  ApiResponse,
  CanteenOrder,
  CanteenOrderItem,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
} from '@/lib/api/canteen.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlaceOrderInput {
  customer_name: string;
  customer_id?: string | null;
  customer_phone?: string | null;
  table_id?: string | null;
  table_name: string;
  items: Omit<CanteenOrderItem, 'id' | 'order_id'>[];
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  order_status?: OrderStatus;
  notes?: string | null;
  discount_amount?: number;
  subtotal: number;
  tax_amount: number;
  service_charge: number;
  total_amount: number;
}

interface UseOfflineOrderResult {
  placeOrder: (input: PlaceOrderInput) => Promise<{ id: string; local: boolean }>;
  isPending: boolean;
  lastError: string | null;
  isOffline: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOfflineOrder(): UseOfflineOrderResult {
  const { isOffline } = useOfflineStatus();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const placeOrder = useCallback(
    async (input: PlaceOrderInput): Promise<{ id: string; local: boolean }> => {
      setIsPending(true);
      setLastError(null);

      // ── ONLINE PATH ────────────────────────────────────────────────────────
      if (!isOffline) {
        try {
          const apiPayload = {
            customerId: input.customer_id ?? null,
            customerName: input.customer_name,
            customerPhone: input.customer_phone ?? null,
            tableId: input.table_id ?? null,
            tableName: input.table_name,
            subtotal: input.subtotal,
            taxAmount: input.tax_amount ?? 0,
            serviceCharge: input.service_charge ?? 0,
            discountAmount: input.discount_amount ?? 0,
            totalAmount: input.total_amount,
            paymentMethod: input.payment_method ?? 'PENDING',
            paymentStatus: input.payment_status ?? 'PENDING',
            orderStatus: input.order_status ?? 'NEW',
            notes: input.notes ?? null,
            items: input.items.map((i) => ({
              menuItemId: i.menu_item_id,
              itemName: i.item_name,
              itemPrice: Number(i.item_price),
              quantity: i.quantity,
              lineTotal: Number(i.line_total),
              cookingNotes: i.cooking_notes ?? null,
            })),
          };

          const { data } = await staffApiClient.post<ApiResponse<CanteenOrder>>(
            '/canteen/orders',
            apiPayload,
          );
          const order = data.data;

          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders() });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables() });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.kitchenQueue() });

          return { id: order.id, local: false };
        } catch (err: any) {
          if (err?.response?.data?.errors) {
            console.error('[POS Checkout Validation Errors]:', err.response.data.errors);
          }
          const msg = err?.response?.data?.message ?? err?.message ?? 'Order failed';
          setLastError(msg);
          throw new Error(msg);
        } finally {
          setIsPending(false);
        }
      }

      // ── OFFLINE PATH ───────────────────────────────────────────────────────
      try {
        const clientId = crypto.randomUUID();
        const tokenNumber = `TKN-${Date.now().toString(36).toUpperCase()}`;

        // 1. Save full order locally
        await db.local_orders.add({
          clientId,
          token_number: tokenNumber,
          customer_id: input.customer_id ?? null,
          customer_name: input.customer_name,
          customer_phone: input.customer_phone ?? null,
          table_id: input.table_id ?? null,
          table_name: input.table_name,
          served_by: null,
          subtotal: input.subtotal,
          tax_amount: input.tax_amount,
          service_charge: input.service_charge,
          discount_amount: input.discount_amount ?? 0,
          total_amount: input.total_amount,
          payment_method: input.payment_method ?? 'PENDING',
          payment_status: input.payment_status ?? 'PENDING',
          order_status: input.order_status ?? 'NEW',
          notes: input.notes ?? null,
          items: input.items,
          createdAt: Date.now(),
          synced: false,
          syncError: null,
        });

        // 2. Queue for server replay on reconnect
        await addToSyncQueue('CREATE_ORDER', {
          ...input,
          id: clientId,
          token_number: tokenNumber,
        }, clientId);

        // 3. Optimistically mark the table OCCUPIED in the local cache
        if (input.table_id) {
          await db.cached_tables.update(input.table_id, {
            status: 'OCCUPIED',
            current_bill: input.total_amount,
            occupied_since: new Date().toISOString(),
          });
        }

        console.info(`[OfflineOrder] Order saved locally (clientId: ${clientId})`);
        return { id: clientId, local: true };
      } catch (err: any) {
        const msg = err?.message ?? 'Failed to save order offline';
        setLastError(msg);
        throw new Error(msg);
      } finally {
        setIsPending(false);
      }
    },
    [isOffline, queryClient],
  );

  return { placeOrder, isPending, lastError, isOffline };
}

// ─── useLocalOrders ───────────────────────────────────────────────────────────

/**
 * useLocalOrders
 *
 * Reads all unsynced orders from Dexie local_orders table.
 * Useful for showing a "pending sync" badge on the orders screen.
 *
 * @example
 * const { orders, count } = useLocalOrders();
 */
import { useEffect, useRef } from 'react';

interface UseLocalOrdersResult {
  orders: import('@/lib/offline/db').LocalOrder[];
  count: number;
  isLoading: boolean;
}

export function useLocalOrders(): UseLocalOrdersResult {
  const [orders, setOrders] = useState<import('@/lib/offline/db').LocalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    db.local_orders
      .where('synced')
      .equals(0)
      .reverse()
      .sortBy('createdAt')
      .then((rows) => {
        if (mounted.current) setOrders(rows);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted.current) setIsLoading(false);
      });

    return () => {
      mounted.current = false;
    };
  }, []);

  return { orders, count: orders.length, isLoading };
}
