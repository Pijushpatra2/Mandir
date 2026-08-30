'use client';

/**
 * useReports.ts
 *
 * Real-time hooks for Canteen Analytics and Sales Reports.
 */

import { useQuery } from '@tanstack/react-query';
import { getActiveClient } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type {
  ApiResponse,
  TodayReportSummary,
  TopCustomer,
  ReportSummary,
} from '@/lib/api/canteen.types';

export interface CanteenSalesReport {
  summary: {
    totalOrders: number;
    paidOrders: number;
    cancelledOrders: number;
    grossRevenue: number;
    subtotal: number;
    discount: number;
    tax: number;
    serviceCharge: number;
    averageOrderValue: number;
    totalItemsSold: number;
    uniqueCustomers: number;
  };
  paymentMethods: {
    CASH: { count: number; revenue: number };
    UPI: { count: number; revenue: number };
    CARD: { count: number; revenue: number };
  };
  itemSales: Array<{
    name: string;
    quantity: number;
    revenue: number;
    unitPrice: number;
  }>;
  dailyTrend: Array<{
    date: string;
    ordersCount: number;
    revenue: number;
  }>;
  orders: Array<{
    id: string;
    tokenNumber: string;
    customerName: string;
    customerPhone: string;
    tableName: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    orderedAt: string;
    date: string;
    time: string;
  }>;
}

export function useCanteenSalesReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['canteen', 'sales-report', startDate || 'all', endDate || 'all'],
    queryFn: async (): Promise<CanteenSalesReport> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<CanteenSalesReport>>(
        '/canteen/reports/summary',
        {
          params: {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          },
        },
      );
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ─── Legacy / Compatibility Hooks ─────────────────────────────────────────────

export function useTodayReport() {
  return useQuery({
    queryKey: QUERY_KEYS.reportsToday(),
    queryFn: async (): Promise<TodayReportSummary> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<TodayReportSummary>>(
        '/canteen/reports/today',
      );
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useTopCustomers(options?: { limit?: number }) {
  const limit = options?.limit ?? 10;
  return useQuery({
    queryKey: QUERY_KEYS.reportsTopCustomers(limit),
    queryFn: async (): Promise<TopCustomer[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<TopCustomer[]>>(
        '/canteen/reports/top-customers',
        { params: { limit } },
      );
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useReportsSummary(range?: { start?: string; end?: string }) {
  const start = range?.start ?? '';
  const end   = range?.end ?? '';

  return useQuery({
    queryKey: QUERY_KEYS.reportsSummary(start, end),
    queryFn: async (): Promise<ReportSummary[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<ReportSummary[]>>(
        '/canteen/reports/summary',
        { params: { startDate: start, endDate: end } },
      );
      return data.data;
    },
    enabled: !!start && !!end,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
