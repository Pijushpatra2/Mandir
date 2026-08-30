'use client';

import { useQuery } from '@tanstack/react-query';
import { getActiveClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/lib/api/canteen.types';

export interface AccountingSummary {
  totalIncome: number;
  totalExpenses: number;
  netSurplus: number;
  canteenRevenue: number;
  shopRevenue: number;
  donationsRevenue: number;
  hallRevenue: number;
  poojaRevenue: number;
  inventoryCost: number;
  wasteLoss: number;
  funds: {
    generalFund: number;
    annadanFund: number;
    buildingFund: number;
    festivalFund: number;
    shopFund: number;
  };
  ledgers: Array<{
    code: string;
    name: string;
    type: 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE';
    dr: number;
    cr: number;
  }>;
  monthlyRevenue: Array<{
    label: string;
    canteen: number;
    shop: number;
    donations: number;
    total: number;
  }>;
}

export interface AccountingVoucher {
  id: string;
  voucherNumber: string;
  voucherType: 'RECEIPT' | 'PAYMENT' | 'SALES' | 'JOURNAL';
  date: string;
  narration: string;
  partyLedger: string;
  category: string;
  amount: number;
  debitLedger: string;
  creditLedger: string;
}

export const ACCOUNTING_QUERY_KEYS = {
  summary: (params?: object) => (params ? ['accounting', 'summary', params] : ['accounting', 'summary'] as const),
  vouchers: (params?: object) => (params ? ['accounting', 'vouchers', params] : ['accounting', 'vouchers'] as const),
};

export function useAccountingSummary(filters?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ACCOUNTING_QUERY_KEYS.summary(filters),
    queryFn: async (): Promise<AccountingSummary> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<AccountingSummary>>('/accounting/summary', {
        params: filters,
      });
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useAccountingVouchers(limit?: number) {
  return useQuery({
    queryKey: ACCOUNTING_QUERY_KEYS.vouchers({ limit }),
    queryFn: async (): Promise<AccountingVoucher[]> => {
      const client = getActiveClient();
      const { data } = await client.get<ApiResponse<AccountingVoucher[]>>('/accounting/vouchers', {
        params: { limit },
      });
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}
