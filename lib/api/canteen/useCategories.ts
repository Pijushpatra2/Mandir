'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApiClient, adminApiClient } from '@/lib/apiClient';
import { getStaffAccessToken, getAdminAccessToken } from '@/lib/authStorage';
import type { ApiResponse } from '@/lib/api/canteen.types';

export interface CanteenCategory {
  id: number;
  name: string;
  created_at: string;
}

function getActiveClient() {
  const hasAdminToken = typeof window !== 'undefined' && !!getAdminAccessToken();
  return hasAdminToken ? adminApiClient : staffApiClient;
}

/**
 * useCategories
 * Retrieves dynamic list of canteen categories.
 */
export function useCategories(options?: { enabled?: boolean }) {
  const { enabled, ...queryOptions } = options ?? {};
  
  return useQuery({
    queryKey: ['canteen_categories'],
    queryFn: async (): Promise<CanteenCategory[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<CanteenCategory[]>>(
        '/canteen/categories'
      );
      return data.data;
    },
    enabled: enabled !== false,
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...queryOptions,
  });
}

/**
 * useAddCategory
 * Creates a new category.
 */
export function useAddCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<CanteenCategory>>(
        '/canteen/categories',
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen_categories'] });
    },
  });
}

/**
 * useDeleteCategory
 * Removes a category.
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const client = getActiveClient();
      const { data } = await client.delete<ApiResponse<null>>(
        `/canteen/categories/${id}`
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen_categories'] });
    },
  });
}

/**
 * useUpdateCategory
 * Modifies an existing category.
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: number; name: string }) => {
      const client = getActiveClient();
      const { data } = await client.put<ApiResponse<CanteenCategory>>(
        `/canteen/categories/${payload.id}`,
        { name: payload.name }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen_categories'] });
      queryClient.invalidateQueries({ queryKey: ['canteen_menu'] });
    },
  });
}
