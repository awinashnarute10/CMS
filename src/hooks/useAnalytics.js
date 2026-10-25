import { useQuery } from '@tanstack/react-query'
import {
  getFootfall,
  getDwell,
  getOccupancyTimeSeries,
  getDemographics,
  getEntryExitRecords,
} from '@/api/analytics'

export const analyticsKeys = {
  all: ['analytics'],
  footfall: (params) => ['analytics', 'footfall', params],
  dwell: (params) => ['analytics', 'dwell', params],
  occupancy: (params) => ['analytics', 'occupancy', params],
  demographics: (params) => ['analytics', 'demographics', params],
  entryExit: (params) => ['analytics', 'entry-exit', params],
}

/**
 * Hook for footfall metric query
 */
export function useFootfallQuery({ siteId, fromUtc, toUtc, enabled = true } = {}) {
  const isEnabled = Boolean(siteId && fromUtc && toUtc && enabled)

  return useQuery({
    queryKey: analyticsKeys.footfall({ siteId, fromUtc, toUtc }),
    queryFn: ({ signal }) => getFootfall({ siteId, fromUtc, toUtc }, { signal }),
    enabled: isEnabled,
    staleTime: 1000 * 30, // 30s
  })
}

/**
 * Hook for today's footfall query (calculates UTC midnight to now)
 */
export function useTodaysFootfallQuery({ siteId, enabled = true } = {}) {
  const isEnabled = Boolean(siteId && enabled)

  return useQuery({
    queryKey: analyticsKeys.footfall({ siteId, period: 'today' }),
    queryFn: ({ signal }) => {
      const now = new Date()
      const startOfDayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
      return getFootfall(
        { siteId, fromUtc: startOfDayUtc, toUtc: now.getTime() },
        { signal }
      )
    },
    enabled: isEnabled,
    staleTime: 1000 * 30,
  })
}

/**
 * Hook for average dwell duration query
 */
export function useDwellQuery({ siteId, fromUtc, toUtc, enabled = true } = {}) {
  const isEnabled = Boolean(siteId && fromUtc && toUtc && enabled)

  return useQuery({
    queryKey: analyticsKeys.dwell({ siteId, fromUtc, toUtc }),
    queryFn: ({ signal }) => getDwell({ siteId, fromUtc, toUtc }, { signal }),
    enabled: isEnabled,
    staleTime: 1000 * 30,
  })
}

export const useAverageDwellQuery = useDwellQuery

/**
 * Hook for hourly occupancy time series query
 */
export function useOccupancyQuery({ siteId, fromUtc, toUtc, enabled = true } = {}) {
  const isEnabled = Boolean(siteId && fromUtc && toUtc && enabled)

  return useQuery({
    queryKey: analyticsKeys.occupancy({ siteId, fromUtc, toUtc }),
    queryFn: ({ signal }) => getOccupancyTimeSeries({ siteId, fromUtc, toUtc }, { signal }),
    enabled: isEnabled,
    staleTime: 1000 * 30,
  })
}

/**
 * Hook for hourly demographics gender trend query
 */
export function useDemographicsQuery({ siteId, fromUtc, toUtc, enabled = true } = {}) {
  const isEnabled = Boolean(siteId && fromUtc && toUtc && enabled)

  return useQuery({
    queryKey: analyticsKeys.demographics({ siteId, fromUtc, toUtc }),
    queryFn: ({ signal }) => getDemographics({ siteId, fromUtc, toUtc }, { signal }),
    enabled: isEnabled,
    staleTime: 1000 * 30,
  })
}

/**
 * Hook for paginated entry/exit activity records
 */
export function useEntryExitQuery({
  siteId,
  fromUtc,
  toUtc,
  pageSize = 50,
  pageNumber = 1,
  enabled = true,
} = {}) {
  const isEnabled = Boolean(siteId && fromUtc && toUtc && enabled)

  return useQuery({
    queryKey: analyticsKeys.entryExit({ siteId, fromUtc, toUtc, pageSize, pageNumber }),
    queryFn: ({ signal }) =>
      getEntryExitRecords(
        { siteId, fromUtc, toUtc, pageSize, pageNumber },
        { signal }
      ),
    enabled: isEnabled,
    staleTime: 1000 * 15,
  })
}
