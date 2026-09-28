'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getActiveClient } from '@/lib/apiClient';
import type {
  StoreRequisition,
  StoreRequisitionItem,
  CreateRequisitionDto,
  AdminApproveRequisitionDto,
  AdminUpdateRequisitionDto,
  ShopkeeperFulfillDto,
  RequisitionStats
} from '@/types/requisition.types';

export const REQUISITION_QUERY_KEYS = {
  all: ['requisitions'] as const,
  list: (filters?: object) => (filters ? ['requisitions', 'list', filters] : ['requisitions', 'list'] as const),
  details: (id: string) => ['requisitions', 'detail', id] as const,
  stats: (shopkeeperId?: string) => ['requisitions', 'stats', shopkeeperId || 'all'] as const,
};

// ─── Query Hooks ─────────────────────────────────────────────────────────────

export function useRequisitions(
  filters?: {
    status?: string;
    department?: string;
    target_shopkeeper_id?: string;
    requested_by_id?: string;
    search?: string;
  },
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  return useQuery({
    queryKey: REQUISITION_QUERY_KEYS.list(filters),
    queryFn: async (): Promise<StoreRequisition[]> => {
      const client = getActiveClient();
      const { data } = await client.get('/requisitions', {
        params: filters,
      });
      return data.data?.requisitions || [];
    },
    staleTime: 5000,
    ...options,
  });
}

export function useRequisitionById(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: REQUISITION_QUERY_KEYS.details(id),
    queryFn: async (): Promise<StoreRequisition> => {
      const client = getActiveClient();
      const { data } = await client.get(`/requisitions/${id}`);
      return data.data?.requisition;
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useRequisitionStats(targetShopkeeperId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: REQUISITION_QUERY_KEYS.stats(targetShopkeeperId),
    queryFn: async (): Promise<RequisitionStats> => {
      const client = getActiveClient();
      const { data } = await client.get('/requisitions/stats', {
        params: targetShopkeeperId ? { target_shopkeeper_id: targetShopkeeperId } : {},
      });
      return data.data?.stats;
    },
    staleTime: 5000,
    ...options,
  });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

/**
 * Canteen Manager submits a new store requisition
 */
export function useCreateRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRequisitionDto): Promise<StoreRequisition> => {
      const client = getActiveClient();
      const { data } = await client.post('/requisitions', payload);
      return data.data?.requisition;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.all });
    },
  });
}

/**
 * Admin approves requisition, modifies quantities, and assigns/confirms Shopkeeper
 */
export function useAdminApproveRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: payload,
    }: {
      id: string;
      data: AdminApproveRequisitionDto;
    }): Promise<StoreRequisition> => {
      const client = getActiveClient();
      const { data } = await client.put(`/requisitions/${id}/admin-approve`, payload);
      return data.data?.requisition;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.details(vars.id) });
    },
  });
}

/**
 * Admin updates storekeeper details, quantities, and prices
 */
export function useAdminUpdateRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: payload,
    }: {
      id: string;
      data: AdminUpdateRequisitionDto;
    }): Promise<StoreRequisition> => {
      const client = getActiveClient();
      const { data } = await client.put(`/requisitions/${id}`, payload);
      return data.data?.requisition;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.details(vars.id) });
    },
  });
}

/**
 * Admin rejects requisition
 */
export function useAdminRejectRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      reason,
      adminName,
    }: {
      id: string;
      reason: string;
      adminName?: string;
    }): Promise<StoreRequisition> => {
      const client = getActiveClient();
      const { data } = await client.put(`/requisitions/${id}/admin-reject`, {
        reason,
        adminName,
      });
      return data.data?.requisition;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.details(vars.id) });
    },
  });
}

/**
 * Shopkeeper fulfills items, enters issued quantity, system auto-calculates remaining
 */
export function useShopkeeperFulfillRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data: payload,
    }: {
      id: string;
      data: ShopkeeperFulfillDto;
    }): Promise<StoreRequisition> => {
      const client = getActiveClient();
      const { data } = await client.put(`/requisitions/${id}/shopkeeper-fulfill`, payload);
      return data.data?.requisition;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.details(vars.id) });
    },
  });
}

/**
 * Admin or Canteen Manager uploads or edits a receipt for a requisition
 */
export function useUploadRequisitionReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      formData,
      jsonData,
    }: {
      id: string;
      formData?: FormData;
      jsonData?: {
        receipt_url?: string;
        receipt_filename?: string;
        receipt_uploaded_by?: string;
        receipt_notes?: string;
      };
    }): Promise<StoreRequisition> => {
      const client = getActiveClient();
      let response;
      if (formData) {
        response = await client.post(`/requisitions/${id}/receipt`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await client.post(`/requisitions/${id}/receipt`, jsonData);
      }
      return response.data?.data?.requisition;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.details(vars.id) });
    },
  });
}

/**
 * Admin or Canteen Manager removes a receipt from a requisition
 */
export function useDeleteRequisitionReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<StoreRequisition> => {
      const client = getActiveClient();
      const { data } = await client.delete(`/requisitions/${id}/receipt`);
      return data.data?.requisition;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: REQUISITION_QUERY_KEYS.details(id) });
    },
  });
}
