'use client';

/**
 * useReports.ts
 *
 * Strategy: CACHED 10-min — fetched when reports dashboard opens.
 * Each date range produces a separate cache entry so clicking between
 * different ranges never re-fetches unnecessarily.
 *
 * Hooks:
 *   useTodayReport()        → GET /canteen/reports/today     (10 min)
 *   useTopCustomers()       → GET /canteen/reports/top-customers (10 min)
 *   useReportsSummary()     → GET /canteen/reports/summary?start=&end= (10 min, per range)
 */

import { useQuery } from '@tanstack/react-query';
import { staffApiClient } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type {
  ApiResponse,
  TodayReportSummary,
  TopCustomer,
  ReportSummary,
} from '@/lib/api/canteen.types';

const REPORTS_STALE = 10 * 60 * 1000; // 10 minutes
const REPORTS_GC    = 30 * 60 * 1000; // 30 minutes in memory

// ─── Today's Summary ──────────────────────────────────────────────────────────

/**
 * useTodayReport
 *
 * CACHED 10-min. Called when the reports dashboard opens.
 * Tab switching does NOT trigger a refetch.
 *
 * @example
 * const { data: summary, isLoading } = useTodayReport();
 */
export function useTodayReport() {
  return useQuery({
    queryKey: QUERY_KEYS.reportsToday(),
    queryFn: async (): Promise<TodayReportSummary> => {
      const { data } = await staffApiClient.get<ApiResponse<TodayReportSummary>>(
        '/canteen/reports/today',
      );
      return data.data;
    },
    staleTime: REPORTS_STALE,
    gcTime: REPORTS_GC,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ─── Top Customers ────────────────────────────────────────────────────────────

/**
 * useTopCustomers
 *
 * CACHED 10-min. Each `limit` value is a separate cache entry.
 *
 * @example
 * const { data: topCustomers = [] } = useTopCustomers({ limit: 10 });
 */
export function useTopCustomers(options?: { limit?: number }) {
  const limit = options?.limit ?? 10;
  return useQuery({
    queryKey: QUERY_KEYS.reportsTopCustomers(limit),
    queryFn: async (): Promise<TopCustomer[]> => {
      const { data } = await staffApiClient.get<ApiResponse<TopCustomer[]>>(
        '/canteen/reports/top-customers',
        { params: { limit } },
      );
      return data.data;
    },
    staleTime: REPORTS_STALE,
    gcTime: REPORTS_GC,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

// ─── Date Range Summary ───────────────────────────────────────────────────────

/**
 * useReportsSummary
 *
 * CACHED 10-min per date range.
 * Each unique (start, end) pair is a separate cache entry — switching between
 * "This Week" and "Last Month" never refetches the cached range.
 *
 * Only fires when both start and end are provided.
 *
 * @example
 * const { data: summary = [] } = useReportsSummary({ start: '2026-07-01', end: '2026-07-05' });
 */
export function useReportsSummary(range?: { start?: string; end?: string }) {
  const start = range?.start ?? '';
  const end   = range?.end ?? '';

  return useQuery({
    queryKey: QUERY_KEYS.reportsSummary(start, end),
    queryFn: async (): Promise<ReportSummary[]> => {
      const { data } = await staffApiClient.get<ApiResponse<ReportSummary[]>>(
        '/canteen/reports/summary',
        { params: { start, end } },
      );
      return data.data;
    },

    // Only fetch when a complete date range is selected
    enabled: !!start && !!end,

    staleTime: REPORTS_STALE,
    gcTime: REPORTS_GC,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
