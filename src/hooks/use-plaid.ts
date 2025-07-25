'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Transaction } from '@/lib/types';

export function usePlaidLinkToken() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to get link token');
      }
      const data = await response.json();
      return data.link_token as string;
    },
  });
}

export function useExchangeToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicToken: string) => {
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token: publicToken }),
      });
      if (!response.ok) {
        throw new Error('Failed to exchange token');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to trigger refetch of both transactions and institution
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['institution'] });
    },
  });
}

interface DateRange {
  from?: Date;
  to?: Date;
}

export function useTransactions(dateRange?: { startDate: string; endDate: string }) {
  return useQuery({
    queryKey: ['transactions', dateRange],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (dateRange?.startDate) searchParams.set('startDate', dateRange.startDate);
      if (dateRange?.endDate) searchParams.set('endDate', dateRange.endDate);
      
      const response = await fetch(`/api/plaid/transactions?${searchParams.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 400) {
          // No access token yet, this is expected for new users
          return [];
        }
        throw new Error(error.message || 'Failed to fetch transactions');
      }
      const data = await response.json();
      return data.transactions as Transaction[];
    },
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: 1000,
    enabled: !!dateRange?.startDate && !!dateRange?.endDate,
  });
}
