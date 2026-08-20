'use client';

/**
 * useOfflineMenu.ts
 *
 * Drop-in replacement for useMenu() that falls back to Dexie
 * when the device is offline. The calling component doesn't need
 * to know whether data came from the API or IndexedDB.
 *
 * LOGIC FLOW:
 *   Online  → TanStack Query fetches/caches from API (30-min stale)
 *   Offline → Reads directly from Dexie cached_menu (instant, no network)
 *
 * USAGE (same API as useMenu):
 *   const { data: menu = [], isLoading, isOffline } = useOfflineMenu();
 */

import { useState, useEffect } from 'react';
import { useOfflineStatus } from '@/lib/offline/OfflineContext';
import { useMenu } from '@/lib/api/canteen/useMenu';
import { db } from '@/lib/offline/db';
import type { CanteenMenuItem } from '@/lib/api/canteen.types';

// Referentially stable static constant to prevent re-render cascading loop from array literals ([])
const EMPTY_ARRAY: any[] = [];

interface OfflineMenuResult {
  data: CanteenMenuItem[];
  isLoading: boolean;
  isOffline: boolean;
  source: 'api' | 'indexeddb' | 'empty';
}

export function useOfflineMenu(
  filters?: { channel?: 'canteen' | 'e-com' | 'both' },
  options?: { enabled?: boolean }
): OfflineMenuResult {
  const { isOffline } = useOfflineStatus();
  const [offlineData, setOfflineData] = useState<CanteenMenuItem[]>([]);
  const [offlineLoading, setOfflineLoading] = useState(false);

  const enabled = options?.enabled ?? true;

  // Online path — TanStack Query handles caching
  const { data: apiData = EMPTY_ARRAY, isLoading: apiLoading } = useMenu(filters, options);

  // Offline path — read from Dexie
  useEffect(() => {
    if (!isOffline || !enabled) return;

    setOfflineLoading(true);
    db.cached_menu
      .orderBy('sort_order')
      .toArray()
      .then((items) => {
        let filtered = items;
        if (filters?.channel) {
          filtered = items.filter(i => 
            filters.channel === 'canteen' ? (i.channel === 'canteen' || i.channel === 'both') :
            filters.channel === 'e-com' ? (i.channel === 'e-com' || i.channel === 'both') :
            i.channel === filters.channel
          );
        }
        setOfflineData(filtered);
      })
      .catch((err) => {
        console.error('[useOfflineMenu] Failed to read from IndexedDB:', err);
      })
      .finally(() => {
        setOfflineLoading(false);
      });
  }, [isOffline, enabled, JSON.stringify(filters)]);

  if (isOffline) {
    return {
      data: offlineData,
      isLoading: offlineLoading,
      isOffline: true,
      source: offlineData.length > 0 ? 'indexeddb' : 'empty',
    };
  }

  return {
    data: apiData,
    isLoading: apiLoading,
    isOffline: false,
    source: 'api',
  };
}

// ─── useOfflineTables ─────────────────────────────────────────────────────────

/**
 * useOfflineTables
 *
 * Same pattern for tables. Falls back to Dexie when offline.
 */
import { useTables } from '@/lib/api/canteen/useTables';
import type { CanteenTable } from '@/lib/api/canteen.types';

interface OfflineTablesResult {
  data: CanteenTable[];
  isLoading: boolean;
  isOffline: boolean;
  source: 'api' | 'indexeddb' | 'empty';
}

export function useOfflineTables(
  params?: { live?: boolean },
  options?: { enabled?: boolean }
): OfflineTablesResult {
  const { isOffline } = useOfflineStatus();
  const [offlineData, setOfflineData] = useState<CanteenTable[]>([]);
  const [offlineLoading, setOfflineLoading] = useState(false);

  const enabled = options?.enabled ?? true;

  const { data: apiData = EMPTY_ARRAY, isLoading: apiLoading } = useTables(params, options);

  useEffect(() => {
    if (!isOffline || !enabled) return;

    setOfflineLoading(true);
    db.cached_tables
      .where('is_active')
      .equals(1)
      .toArray()
      .then((items) => setOfflineData(items))
      .catch((err) => console.error('[useOfflineTables]', err))
      .finally(() => setOfflineLoading(false));
  }, [isOffline, enabled]);

  if (isOffline) {
    return {
      data: offlineData,
      isLoading: offlineLoading,
      isOffline: true,
      source: offlineData.length > 0 ? 'indexeddb' : 'empty',
    };
  }

  return {
    data: apiData,
    isLoading: apiLoading,
    isOffline: false,
    source: 'api',
  };
}

// ─── useOfflineCustomerSearch ─────────────────────────────────────────────────

/**
 * useOfflineCustomerSearch
 *
 * When offline, searches Dexie cached_customers by name or phone.
 * When online, delegates to the API search hook (enabled ≥2 chars).
 */
import { useCustomerSearch } from '@/lib/api/canteen/useCustomers';
import type { CanteenCustomer } from '@/lib/api/canteen.types';

interface OfflineCustomerSearchResult {
  data: CanteenCustomer[];
  isLoading: boolean;
  isOffline: boolean;
  source: 'api' | 'indexeddb' | 'empty';
}

export function useOfflineCustomerSearch(search: string): OfflineCustomerSearchResult {
  const { isOffline } = useOfflineStatus();
  const [offlineData, setOfflineData] = useState<CanteenCustomer[]>([]);
  const [offlineLoading, setOfflineLoading] = useState(false);

  const { data: apiResult, isLoading: apiLoading } = useCustomerSearch(search);
  const apiData = apiResult?.data ?? EMPTY_ARRAY;

  useEffect(() => {
    if (!isOffline || search.length < 2) {
      setOfflineData([]);
      return;
    }

    setOfflineLoading(true);
    const q = search.toLowerCase();
    db.cached_customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(search),
      )
      .limit(10)
      .toArray()
      .then((results) => setOfflineData(results))
      .catch((err) => console.error('[useOfflineCustomerSearch]', err))
      .finally(() => setOfflineLoading(false));
  }, [isOffline, search]);

  if (isOffline) {
    return {
      data: offlineData,
      isLoading: offlineLoading,
      isOffline: true,
      source: offlineData.length > 0 ? 'indexeddb' : 'empty',
    };
  }

  return {
    data: apiData,
    isLoading: apiLoading,
    isOffline: false,
    source: 'api',
  };
}

// ─── useOfflineOrders ─────────────────────────────────────────────────────────

import { useOrders } from '@/lib/api/canteen/useOrders';
import type { CanteenOrder } from '@/lib/api/canteen.types';

interface OfflineOrdersResult {
  data: CanteenOrder[];
  isLoading: boolean;
  isOffline: boolean;
  source: 'api' | 'indexeddb' | 'empty';
}

export function useOfflineOrders(
  filters?: { status?: any; table_id?: string; date?: string },
  options?: { enabled?: boolean }
): OfflineOrdersResult {
  const { isOffline } = useOfflineStatus();
  const [offlineData, setOfflineData] = useState<CanteenOrder[]>([]);
  const [offlineLoading, setOfflineLoading] = useState(false);

  const enabled = options?.enabled ?? true;
  const { data: apiData = EMPTY_ARRAY, isLoading: apiLoading } = useOrders(filters, options);

  useEffect(() => {
    if (!isOffline || !enabled) return;

    setOfflineLoading(true);
    db.local_orders
      .toArray()
      .then((items) => {
        const mapped: CanteenOrder[] = items.map((l) => ({
          id: l.clientId,
          token_number: l.token_number,
          customer_id: l.customer_id,
          customer_name: l.customer_name,
          customer_phone: l.customer_phone,
          table_id: l.table_id,
          table_name: l.table_name,
          served_by: l.served_by,
          subtotal: l.subtotal,
          tax_amount: l.tax_amount,
          service_charge: l.service_charge,
          discount_amount: l.discount_amount,
          total_amount: l.total_amount,
          payment_method: l.payment_method,
          payment_status: l.payment_status,
          order_status: l.order_status,
          notes: l.notes,
          ordered_at: new Date(l.createdAt || Date.now()).toISOString(),
          completed_at: null,
          created_at: new Date(l.createdAt || Date.now()).toISOString(),
          updated_at: new Date(l.createdAt || Date.now()).toISOString(),
          items: l.items,
        }));
        setOfflineData(mapped);
      })
      .catch((err) => console.error('[useOfflineOrders]', err))
      .finally(() => setOfflineLoading(false));
  }, [isOffline, enabled]);

  if (isOffline) {
    return {
      data: offlineData,
      isLoading: offlineLoading,
      isOffline: true,
      source: offlineData.length > 0 ? 'indexeddb' : 'empty',
    };
  }

  return {
    data: apiData,
    isLoading: apiLoading,
    isOffline: false,
    source: 'api',
  };
}
