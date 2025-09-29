'use client'

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error && typeof error === 'object' && 'message' in error) {
          if (error.message.includes('Authentication required')) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  },
});

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };