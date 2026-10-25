import { QueryClient } from '@tanstack/react-query'

export function shouldRetryQuery(failureCount, error) {
  // Max 2 retries
  if (failureCount >= 2) return false

  // Never retry client, validation, or authentication failures (4xx)
  const status = error?.status
  if (
    error?.isClientError ||
    error?.isAuthError ||
    (typeof status === 'number' && status >= 400 && status < 500)
  ) {
    return false
  }

  // Allow retry on network disconnects or 5xx server issues
  return true
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: shouldRetryQuery,
    },
    mutations: {
      retry: false,
    },
  },
})
