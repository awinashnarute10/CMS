import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startSimulation, stopSimulation } from '@/api/simulation'
import { analyticsKeys } from '@/hooks/useAnalytics'

export function useStartSimulation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: startSimulation,
    onSuccess: () => {
      // Invalidate analytics queries so live synthetic data is reflected immediately
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
    },
  })
}

export function useStopSimulation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: stopSimulation,
    onSuccess: () => {
      // Invalidate analytics queries to capture frozen or stopped state
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
    },
  })
}
