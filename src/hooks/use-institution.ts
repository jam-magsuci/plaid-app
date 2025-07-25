'use client';

import { useQuery } from '@tanstack/react-query';

interface Institution {
  name: string;
  logo: string;
  primaryColor: string;
}

export function useInstitution() {
  return useQuery<Institution>({
    queryKey: ['institution'],
    queryFn: async () => {
      const response = await fetch('/api/plaid/institution');
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 400) {
          // No institution ID yet, this is expected for new users
          return null;
        }
        throw new Error(error.message || 'Failed to fetch institution');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
