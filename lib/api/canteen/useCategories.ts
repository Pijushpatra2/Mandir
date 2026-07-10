'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/lib/api/canteen.types';

export interface CanteenCategory {
  id: number;
  name: string;
  created_at: string;
}

/**
 * useCategories
 * Retrieves dynamic list of canteen categories.
 */
export function useCategories(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['canteen_categories'],
    queryFn: async (): Promise<CanteenCategory[]> => {
      const { data } = await staffApiClient.get<ApiResponse<CanteenCategory[]>>(
        '/canteen/categories'
      );
      return data.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
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
      const { data } = await staffApiClient.post<ApiResponse<CanteenCategory>>(
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
      const { data } = await staffApiClient.delete<ApiResponse<null>>(
        `/canteen/categories/${id}`
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen_categories'] });
    },
  });
}
