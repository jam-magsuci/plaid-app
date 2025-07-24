'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
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
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch('/api/plaid/transactions');
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
  });
}
