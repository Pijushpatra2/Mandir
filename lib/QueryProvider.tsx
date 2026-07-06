'use client';

/**
 * QueryProvider.tsx
 *
 * Wraps the app with TanStack Query (React Query) QueryClientProvider.
 * Configures global cache rules:
 *   - staleTime: 5 minutes  → No API refetch for 5 min after a successful fetch
 *   - gcTime: 30 minutes    → Keep cached data in memory for 30 minutes
 *   - refetchOnWindowFocus: false → Switching browser tabs NEVER triggers a refetch
 *   - refetchOnReconnect: true   → Coming back online WILL refresh stale data
 *   - retry: 1                   → Retry failed requests once before showing error
 *
 * Individual queries can override these defaults where needed (e.g., KDS live polls).
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  /**
   * Create the QueryClient inside useState so each browser session gets
   * a fresh client without sharing state across SSR renders.
   */
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 5 minutes — no network call on page reload
            staleTime: 5 * 60 * 1000,

            // Keep cached data in memory for 30 minutes after component unmounts
            gcTime: 30 * 60 * 1000,

            // CRITICAL: Never refetch when user switches browser tabs
            refetchOnWindowFocus: false,

            // Refetch stale queries when internet connection is restored
            refetchOnReconnect: true,

            // Retry once on failure (network blip tolerance)
            retry: 1,

            // Don't refetch on component mount if data is already fresh
            refetchOnMount: true,
          },
          mutations: {
            // Mutations do not retry by default (avoid duplicate order submissions)
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
