import { useQuery } from '@tanstack/react-query'
import { getSites, getSiteById } from '@/api/sites'

export const sitesKeys = {
  all: ['sites'],
  detail: (siteId) => ['sites', 'detail', siteId],
}

export function useSitesQuery(options = {}) {
  return useQuery({
    queryKey: sitesKeys.all,
    queryFn: ({ signal }) => getSites({ signal }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  })
}

export function useSiteDetailsQuery(siteId, options = {}) {
  return useQuery({
    queryKey: sitesKeys.detail(siteId),
    queryFn: ({ signal }) => getSiteById(siteId, { signal }),
    enabled: Boolean(siteId) && (options.enabled ?? true),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}
