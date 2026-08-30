'use client';

/**
 * useCustomers.ts
 *
 * Real-time CRUD and CRM hooks for Canteen Customer management.
 *
 * Hooks:
 *   useCustomers()       → GET /canteen/customers?search=&customerType=&page=
 *   useAddCustomer()     → POST /canteen/customers
 *   useEditCustomer()    → PATCH /canteen/customers/:id
 *   useDeleteCustomer()  → DELETE /canteen/customers/:id
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

export type { CanteenCustomer, CustomerType, PaginatedResult, PaginationMeta };

// ─── Fetch Customers ──────────────────────────────────────────────────────────

export interface CustomerFilters {
  search?: string;
  customerType?: string;
  page?: number;
  limit?: number;
}

export function useCustomers(filters?: CustomerFilters, options?: { enabled?: boolean }) {
  const search = filters?.search ?? '';
  const customerType = filters?.customerType ?? '';
  const page   = filters?.page ?? 1;
  const limit  = filters?.limit ?? 50;

  return useQuery({
    queryKey: ['canteen', 'customers', search, customerType, page, limit],
    queryFn: async (): Promise<PaginatedResult<CanteenCustomer>> => {
      const client = getActiveClient();
      const { data } = await client.get<{
        success: boolean;
        message: string;
        data: CanteenCustomer[];
        meta: PaginationMeta;
      }>(
        '/canteen/customers',
        { params: { search, customerType: customerType || undefined, page, limit } },
      );
      return {
        data: data.data || [],
        meta: data.meta || { page: 1, limit: 50, total: 0, totalPages: 1 },
      };
    },
    enabled: options?.enabled ?? true,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * useCustomerSearch
 *
 * Lighter hook for POS quick-search input.
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
        data: data.data || [],
        meta: data.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
      };
    },
    enabled: search.length >= 2,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ─── Add Customer ─────────────────────────────────────────────────────────────

export interface AddCustomerPayload {
  name: string;
  phone: string;
  email?: string | null;
  customer_type?: CustomerType;
  notes?: string | null;
}

export function useAddCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddCustomerPayload) => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<{ id: string }>>(
        '/canteen/customers',
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'customers'] });
    },
    retry: false,
  });
}

// ─── Edit Customer ────────────────────────────────────────────────────────────

export interface EditCustomerPayload {
  id: string;
  updates: Partial<AddCustomerPayload & { is_active: boolean }>;
}

export function useEditCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: EditCustomerPayload) => {
      const client = getActiveClient();
      const { data } = await client.patch<ApiResponse<null>>(
        `/canteen/customers/${id}`,
        updates,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'customers'] });
    },
    retry: false,
  });
}

// ─── Delete Customer ──────────────────────────────────────────────────────────

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const client = getActiveClient();
      const { data } = await client.delete<ApiResponse<null>>(
        `/canteen/customers/${id}`,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'customers'] });
    },
    retry: false,
  });
}
