'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveClient } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type { ApiResponse } from '@/lib/api/canteen.types';
import type { Product } from '@/data/products';

export interface ProductPayload {
  name: string;
  price: number;
  stock?: number;
  categoryId?: string;
  description?: string;
  images?: string[];
  specs?: Record<string, string>;
  isFeatured?: boolean;
  isNew?: boolean;
}

export function useProducts(
  filters?: { categoryId?: string; search?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: QUERY_KEYS.products(filters),
    queryFn: async (): Promise<Product[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<Product[]>>('/products', {
        params: filters,
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useProductBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.product(slug),
    queryFn: async (): Promise<Product> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<Product>>(`/products/slug/${slug}`);
      return data.data;
    },
    enabled: Boolean(slug) && (options?.enabled ?? true),
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProductPayload): Promise<Product> => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<Product>>('/products', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ProductPayload> }): Promise<Product> => {
      const client = getActiveClient();
      const { data } = await client.put<ApiResponse<Product>>(`/products/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products() });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const client = getActiveClient();
      await client.delete<ApiResponse<null>>(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products() });
    },
  });
}
