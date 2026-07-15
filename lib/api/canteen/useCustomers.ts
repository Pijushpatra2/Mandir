'use client';

/**
 * useCustomers.ts
 *
 * Strategy: CACHED 5-min. Only fetches when searchQuery has content.
 * Empty search → no API call (enabled: !!search).
 *
 * Hooks:
 *   useCustomers()       → GET /canteen/customers?search=&page= (CACHED 5 min)
 *   useAddCustomer()     → POST /canteen/customers
 *   useEditCustomer()    → PATCH /canteen/customers/:id
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveClient } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type {
  ApiResponse,
  CanteenCustomer,
  CustomerType,
  PaginatedResult,
  PaginationMeta,
} from '@/lib/api/canteen.types';

// ─── Fetch Customers ──────────────────────────────────────────────────────────

interface CustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * useCustomers
 *
 * Only fires an API request when `search` has a value.
 * An empty search box → zero API calls.
 *
 * @example
 * // Fires API only when user types something
 * const { data, isLoading } = useCustomers({ search: inputValue, page: 1 });
 *
 * // Full customer list on customers page (no search filter)
 * const { data } = useCustomers({ page: 1 });
 */
export function useCustomers(filters?: CustomerFilters, options?: { enabled?: boolean }) {
  const search = filters?.search ?? '';
  const page   = filters?.page ?? 1;
  const limit  = filters?.limit ?? 20;

  return useQuery({
    queryKey: QUERY_KEYS.customers(search, page),
    queryFn: async (): Promise<PaginatedResult<CanteenCustomer>> => {
      const client = getActiveClient();
      const { data } = await client.get<{
        success: boolean;
        message: string;
        data: CanteenCustomer[];
        meta: PaginationMeta;
      }>(
        '/canteen/customers',
        { params: { search, page, limit } },
      );
      return {
        data: data.data,
        meta: data.meta,
      };
    },

    // Default to true, or merge from options
    enabled: options?.enabled ?? true,

    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * useCustomerSearch
 *
 * Lighter hook for the POS quick-search input — enabled ONLY when user types.
 * Empty input → zero API calls.
 *
 * @example
 * const { data } = useCustomerSearch(searchInput);
 */
export function useCustomerSearch(search: string) {
  return useQuery({
    queryKey: QUERY_KEYS.customers(search),
    queryFn: async (): Promise<PaginatedResult<CanteenCustomer>> => {
      const client = getActiveClient();
      const { data } = await client.get<{
        success: boolean;
        message: string;
        data: CanteenCustomer[];
        meta: PaginationMeta;
      }>(
        '/canteen/customers',
        { params: { search, limit: 10 } },
      );
      return {
        data: data.data,
        meta: data.meta,
      };
    },

    // CRITICAL: Only fire when user has typed at least 2 characters
    enabled: search.length >= 2,

    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ─── Add Customer ─────────────────────────────────────────────────────────────

interface AddCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  customer_type?: CustomerType;
  notes?: string;
}

/**
 * useAddCustomer
 *
 * Strategy: ON-ACT — fires on receptionist form submit.
 * After success: invalidates ['customers'] cache.
 */
export function useAddCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddCustomerPayload) => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<CanteenCustomer>>(
        '/canteen/customers',
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers() });
    },
    retry: false,
  });
}

// ─── Edit Customer ────────────────────────────────────────────────────────────

interface EditCustomerPayload {
  id: string;
  updates: Partial<AddCustomerPayload & { is_active: boolean }>;
}

/**
 * useEditCustomer
 *
 * Strategy: ON-ACT — fires on form submit.
 * After success: invalidates ['customers', id] and ['customers'] list.
 */
export function useEditCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: EditCustomerPayload) => {
      const client = getActiveClient();
      const { data } = await client.patch<ApiResponse<CanteenCustomer>>(
        `/canteen/customers/${id}`,
        updates,
      );
      return data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customer(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers() });
    },
    retry: false,
  });
}
