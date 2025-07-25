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

export function useSyncStatus() {
  const queryClient = useQueryClient();
  const syncStatusKey = ['transactions', 'syncStatus'] as const;
  return queryClient.getQueryData(syncStatusKey) as 'syncing' | 'complete' | undefined;
}

export function useTransactions(dateRange?: { startDate: string; endDate: string }) {
  const queryClient = useQueryClient();
  const firstFetchTimeKey = ['transactions', 'firstFetchTime'] as const;
  const syncStatusKey = ['transactions', 'syncStatus'] as const;

  return useQuery<Transaction[], Error, Transaction[], [string, typeof dateRange]>({
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
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache old data
    initialData: [], // Start with empty array
    refetchInterval: (query) => {
      const data = query.state.data;
      const prevData = query.state.data; // Get previous data snapshot
      const firstFetchTime = queryClient.getQueryData(firstFetchTimeKey) as number | undefined;
      
      // If this is the first fetch with data, start polling
      if (data?.length && data.length > 0) {
        if (!firstFetchTime) {
          queryClient.setQueryData(firstFetchTimeKey, Date.now());
          queryClient.setQueryData(syncStatusKey, 'syncing');
          return 10000; // Start polling
        }

        // Check if we've received new transactions in this fetch
        const hasNewTransactions = data.length > (prevData?.length || 0);
        const timeSinceFirstFetch = Date.now() - firstFetchTime;

        // Continue polling if we're still getting new data or haven't reached timeout
        if (hasNewTransactions || timeSinceFirstFetch < 30 * 1000) { // 30 seconds timeout
          return 10000; // Poll every 10 seconds
        }

        // No new transactions and timeout reached, stop polling
        queryClient.removeQueries({ queryKey: firstFetchTimeKey });
        queryClient.setQueryData(syncStatusKey, 'complete');
        return false;
      }
      
      // No data yet, don't start polling
      return false;
    },
    enabled: !!dateRange?.startDate && !!dateRange?.endDate,
  });
}
