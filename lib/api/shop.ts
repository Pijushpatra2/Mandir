'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/lib/api/canteen.types';
import type {
  ShopProduct,
  ShopCategory,
  ShopCustomer,
  ShopOrder,
  ShopCoupon,
  ShopReview,
} from '@/types/shop.types';

// Export types for frontend consumption
export type {
  ShopProduct,
  ShopCategory,
  ShopCustomer,
  ShopOrder,
  ShopOrderItem,
  ShopCoupon,
  ShopReview,
  ShopOrderTimelineStep,
} from '@/types/shop.types';

export const SHOP_QUERY_KEYS = {
  products: (filters?: object) => (filters ? ['shop', 'products', filters] : ['shop', 'products'] as const),
  product: (idOrSlug: string) => ['shop', 'product', idOrSlug] as const,
  categories: () => ['shop', 'categories'] as const,
  orders: (filters?: object) => (filters ? ['shop', 'orders', filters] : ['shop', 'orders'] as const),
  order: (id: string) => ['shop', 'orders', id] as const,
  customers: (search?: string) => (search ? ['shop', 'customers', search] : ['shop', 'customers'] as const),
  coupons: () => ['shop', 'coupons'] as const,
  reviews: (productId?: string) => (productId ? ['shop', 'reviews', productId] : ['shop', 'reviews'] as const),
};

// ─── Products Hooks ─────────────────────────────────────────────────────────

export function useShopProducts(
  filters?: { categoryId?: string; search?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: SHOP_QUERY_KEYS.products(filters),
    queryFn: async (): Promise<ShopProduct[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<ShopProduct[]>>('/shop/products', {
        params: filters,
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useShopProductBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: SHOP_QUERY_KEYS.product(slug),
    queryFn: async (): Promise<ShopProduct> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<ShopProduct>>(`/shop/products/slug/${slug}`);
      return data.data;
    },
    enabled: Boolean(slug) && (options?.enabled ?? true),
  });
}

export function useAddShopProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ShopProduct>): Promise<ShopProduct> => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<ShopProduct>>('/shop/products', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'products'] });
    },
  });
}

export function useUpdateShopProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ShopProduct> }): Promise<ShopProduct> => {
      const client = getActiveClient();
      const { data } = await client.put<ApiResponse<ShopProduct>>(`/shop/products/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'products'] });
    },
  });
}

export function useDeleteShopProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const client = getActiveClient();
      await client.delete<ApiResponse<null>>(`/shop/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'products'] });
    },
  });
}

// ─── Categories Hooks ───────────────────────────────────────────────────────

export function useShopCategories(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: SHOP_QUERY_KEYS.categories(),
    queryFn: async (): Promise<ShopCategory[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<ShopCategory[]>>('/shop/categories');
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useAddShopCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ShopCategory>): Promise<ShopCategory> => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<ShopCategory>>('/shop/categories', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.categories() });
    },
  });
}

// ─── Orders Hooks ───────────────────────────────────────────────────────────

export function useShopOrders(
  filters?: { status?: string; search?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: SHOP_QUERY_KEYS.orders(filters),
    queryFn: async (): Promise<ShopOrder[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<ShopOrder[]>>('/shop/orders', {
        params: filters,
      });
      return data.data;
    },
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

export function useShopOrderById(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: SHOP_QUERY_KEYS.order(id),
    queryFn: async (): Promise<ShopOrder> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<ShopOrder>>(`/shop/orders/${id}`);
      return data.data;
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useMyDevoteeOrders(params?: { devoteeId?: string; email?: string; phone?: string }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['shop', 'orders', 'my', params],
    queryFn: async (): Promise<ShopOrder[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<ShopOrder[]>>('/shop/orders/my', {
        params,
      });
      return data.data;
    },
    staleTime: 10 * 1000,
    ...options,
  });
}

export function useCreateShopOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any): Promise<ShopOrder> => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<ShopOrder>>('/shop/orders', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['shop', 'customers'] });
      queryClient.invalidateQueries({ queryKey: ['shop', 'products'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      trackingNumber,
    }: {
      id: string;
      status: string;
      trackingNumber?: string;
    }): Promise<ShopOrder> => {
      const client = getActiveClient();
      const { data } = await client.patch<ApiResponse<ShopOrder>>(`/shop/orders/${id}/status`, {
        status,
        trackingNumber,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'orders'] });
    },
  });
}

// ─── Customers Hooks ────────────────────────────────────────────────────────

export function useShopCustomers(search?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: SHOP_QUERY_KEYS.customers(search),
    queryFn: async (): Promise<ShopCustomer[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<ShopCustomer[]>>('/shop/customers', {
        params: { search },
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ─── Coupons Hooks ──────────────────────────────────────────────────────────

export function useShopCoupons(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: SHOP_QUERY_KEYS.coupons(),
    queryFn: async (): Promise<ShopCoupon[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<ShopCoupon[]>>('/shop/coupons');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useAddShopCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ShopCoupon>): Promise<ShopCoupon> => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<ShopCoupon>>('/shop/coupons', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.coupons() });
    },
  });
}

export function useToggleShopCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<ShopCoupon> => {
      const client = getActiveClient();
      const { data } = await client.patch<ApiResponse<ShopCoupon>>(`/shop/coupons/${id}/toggle`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.coupons() });
    },
  });
}

export function useDeleteShopCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const client = getActiveClient();
      await client.delete<ApiResponse<null>>(`/shop/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.coupons() });
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({
      code,
      subtotal,
    }: {
      code: string;
      subtotal: number;
    }): Promise<{ coupon: ShopCoupon; discount: number; newTotal: number }> => {
      const client = getActiveClient();
      const { data } = await client.post<
        ApiResponse<{ coupon: ShopCoupon; discount: number; newTotal: number }>
      >('/shop/coupons/validate', { code, subtotal });
      return data.data;
    },
  });
}

// ─── Reviews Hooks ──────────────────────────────────────────────────────────

export function useShopReviews(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['shop', 'reviews'],
    queryFn: async (): Promise<ShopReview[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<ShopReview[]>>('/shop/reviews');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useProductReviews(productId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: SHOP_QUERY_KEYS.reviews(productId),
    queryFn: async (): Promise<ShopReview[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<ShopReview[]>>(`/shop/reviews/product/${productId}`);
      return data.data;
    },
    enabled: Boolean(productId) && (options?.enabled ?? true),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      productId: string;
      customerName: string;
      rating: number;
      comment: string;
      verifiedPurchase?: boolean;
    }): Promise<ShopReview> => {
      const client = getActiveClient();
      const { data } = await client.post<ApiResponse<ShopReview>>('/shop/reviews', payload);
      return data.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.reviews(vars.productId) });
      queryClient.invalidateQueries({ queryKey: ['shop', 'products'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const client = getActiveClient();
      await client.delete<ApiResponse<null>>(`/shop/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['shop', 'products'] });
    },
  });
}
