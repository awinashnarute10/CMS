import { useState, useMemo } from 'react'
import { Users, Footprints, Clock } from 'lucide-react'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { KpiCard } from '@/components/common/KpiCard'
import { TimeRangeSelector, computeRangeFromPreset } from '@/components/common/TimeRangeSelector'
import { ChartCard } from '@/components/common/ChartCard'
import { OccupancyTimeChart } from '@/components/charts/OccupancyTimeChart'
import { DemographicsTrendChart } from '@/components/charts/DemographicsTrendChart'
import { DemographicsBreakdownChart } from '@/components/charts/DemographicsBreakdownChart'
import { useSite } from '@/context/SiteContext'
import {
  useOccupancyQuery,
  useTodaysFootfallQuery,
  useYesterdayFootfallQuery,
  useDwellQuery,
  useDemographicsQuery,
} from '@/hooks/useAnalytics'
import { formatDwellDuration } from '@/lib/utils'

function extractSeries(response) {
  if (!response) return []
  if (Array.isArray(response)) return response

  // Check known array properties
  const arrayProp = [
    'records',
    'buckets',
    'occupancyBuckets',
    'hourlyOccupancy',
    'occupancyTimeSeries',
    'data',
    'occupancy',
    'demographics',
    'series',
    'timeline',
    'results',
    'history',
    'hourly',
  ].find((prop) => Array.isArray(response[prop]))

  if (arrayProp) return response[arrayProp]

  // Check if any property in the response object is an array
  if (typeof response === 'object' && response !== null) {
    const anyArrayKey = Object.keys(response).find((k) => Array.isArray(response[k]))
    if (anyArrayKey) return response[anyArrayKey]

    // Key-value map (e.g. { "10:00": 20, "11:00": 35 } or timestamp keys)
    const entries = Object.entries(response).filter(
      ([k]) => k !== 'siteId' && k !== 'fromUtc' && k !== 'toUtc'
    )
    if (entries.length > 0) {
      const mapped = entries
        .map(([key, val]) => {
          if (typeof val === 'number') {
            return {
              timestamp: isNaN(Number(key)) ? null : Number(key),
              timeLabel: key,
              occupancy: val,
            }
          }
          if (typeof val === 'object' && val !== null) {
            return {
              timestamp: isNaN(Number(key)) ? null : Number(key),
              timeLabel: key,
              ...val,
            }
          }
          return null
        })
        .filter(Boolean)
      if (mapped.length > 0) return mapped
    }
  }

  return []
}

export function OverviewPage() {
  const { selectedSite, selectedSiteId, isLoading: isLoadingSite, realtimeOccupancy } = useSite()
  const [timePreset, setTimePreset] = useState('24h')

  const { fromUtc, toUtc } = useMemo(
    () => computeRangeFromPreset(timePreset),
    [timePreset]
  )

  // Analytics queries
  const occupancyQuery = useOccupancyQuery({
    siteId: selectedSiteId,
    fromUtc,
    toUtc,
    enabled: Boolean(selectedSiteId),
  })

  const footfallQuery = useTodaysFootfallQuery({
    siteId: selectedSiteId,
    enabled: Boolean(selectedSiteId),
  })

  const yesterdayFootfallQuery = useYesterdayFootfallQuery({
    siteId: selectedSiteId,
    enabled: Boolean(selectedSiteId),
  })

  const footfallComparison = useMemo(() => {
    const today = footfallQuery.data?.footfall
    const yesterday = yesterdayFootfallQuery.data?.footfall
    if (typeof today === 'number' && typeof yesterday === 'number' && yesterday > 0) {
      const diff = today - yesterday
      const pct = Math.round((diff / yesterday) * 100)
      const sign = pct >= 0 ? '+' : ''
      return {
        delta: `${sign}${pct}% vs yesterday`,
        trend: pct >= 0 ? 'up' : 'down',
      }
    }
    return null
  }, [footfallQuery.data?.footfall, yesterdayFootfallQuery.data?.footfall])

  const dwellQuery = useDwellQuery({
    siteId: selectedSiteId,
    fromUtc,
    toUtc,
    enabled: Boolean(selectedSiteId),
  })

  const demographicsQuery = useDemographicsQuery({
    siteId: selectedSiteId,
    fromUtc,
    toUtc,
    enabled: Boolean(selectedSiteId),
  })

  // Normalize chart series
  const occupancySeries = useMemo(
    () => extractSeries(occupancyQuery.data),
    [occupancyQuery.data]
  )

  const demographicsSeries = useMemo(
    () => extractSeries(demographicsQuery.data),
    [demographicsQuery.data]
  )

  // Compute Live Occupancy prioritizing shared real-time state, then latest historic bucket
  const liveOccupancy = useMemo(() => {
    if (realtimeOccupancy !== null) {
      return realtimeOccupancy
    }
    if (occupancySeries.length > 0) {
      const last = occupancySeries[occupancySeries.length - 1]
      return typeof last.occupancy === 'number' ? last.occupancy : Number(last.count ?? 0)
    }
    return null
  }, [realtimeOccupancy, occupancySeries])

  const isLiveStreamActive = realtimeOccupancy !== null

  // Authentic last-updated timestamp from real query execution
  const lastUpdatedMs = Math.max(
    occupancyQuery.dataUpdatedAt || 0,
    footfallQuery.dataUpdatedAt || 0,
    dwellQuery.dataUpdatedAt || 0,
    demographicsQuery.dataUpdatedAt || 0
  )
  const lastUpdatedFormatted = lastUpdatedMs > 0
    ? new Date(lastUpdatedMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        actions={
          <div className="flex items-center gap-3">
            {lastUpdatedFormatted && (
              <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
                Updated {lastUpdatedFormatted}
              </span>
            )}
            <TimeRangeSelector
              value={timePreset}
              onChange={setTimePreset}
            />
          </div>
        }
      />

      {/* KPI Cards Row — 3 Required Enterprise Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Live Occupancy */}
        <KpiCard
          title="Live Occupancy"
          value={liveOccupancy != null ? liveOccupancy.toLocaleString() : null}
          unit="persons"
          icon={Users}
          isLoading={liveOccupancy == null && isLoadingSite}
          isError={isLiveStreamActive ? false : (liveOccupancy == null && occupancyQuery.isError)}
          errorMessage={occupancyQuery.error?.message}
          onRetry={() => occupancyQuery.refetch()}
          subtitle={
            isLiveStreamActive
              ? 'Real-time venue count'
              : occupancySeries.length > 0
              ? 'Last recorded count'
              : 'No occupancy data'
          }
        />

        {/* KPI 2: Today's Footfall */}
        <KpiCard
          title="Today's Footfall"
          value={footfallQuery.data?.footfall != null ? footfallQuery.data.footfall.toLocaleString() : null}
          unit="entries"
          icon={Footprints}
          comparison={footfallComparison}
          isLoading={footfallQuery.isLoading || isLoadingSite}
          isError={footfallQuery.isError}
          errorMessage={footfallQuery.error?.message}
          onRetry={() => footfallQuery.refetch()}
          subtitle="Cumulative entries since 00:00 UTC"
        />

        {/* KPI 3: Avg Dwell Time */}
        <KpiCard
          title="Avg Dwell Time"
          value={
            dwellQuery.data?.avgDwellMinutes != null
              ? formatDwellDuration(dwellQuery.data.avgDwellMinutes)
              : null
          }
          icon={Clock}
          isLoading={dwellQuery.isLoading || isLoadingSite}
          isError={dwellQuery.isError}
          errorMessage={dwellQuery.error?.message}
          onRetry={() => dwellQuery.refetch()}
          subtitle={
            dwellQuery.data?.dwellRecords
              ? `Based on ${dwellQuery.data.dwellRecords.toLocaleString()} recorded visits`
              : 'Across selected period'
          }
        />
      </div>

      {/* Primary Analytics Section: Full-Width Occupancy Time-Series */}
      <ChartCard
        title="Occupancy Over Time"
        description="Hourly crowd distribution within the selected observation window"
        isLoading={occupancyQuery.isLoading}
        isError={occupancyQuery.isError}
        errorMessage={occupancyQuery.error?.message}
        onRetry={() => occupancyQuery.refetch()}
        isEmpty={occupancySeries.length === 0}
      >
        <OccupancyTimeChart data={occupancySeries} />
      </ChartCard>

      {/* Secondary Analytics Section: Demographics Trend & Demographics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Gender Demographics Trend"
          description="Hourly comparison between male and female visitors"
          className="lg:col-span-2"
          isLoading={demographicsQuery.isLoading}
          isError={demographicsQuery.isError}
          errorMessage={demographicsQuery.error?.message}
          onRetry={() => demographicsQuery.refetch()}
          isEmpty={demographicsSeries.length === 0}
        >
          <DemographicsTrendChart data={demographicsSeries} />
        </ChartCard>

        <ChartCard
          title="Gender Demographics"
          description="Overall male vs. female proportion"
          isLoading={demographicsQuery.isLoading}
          isError={demographicsQuery.isError}
          errorMessage={demographicsQuery.error?.message}
          onRetry={() => demographicsQuery.refetch()}
          isEmpty={demographicsSeries.length === 0}
        >
          <DemographicsBreakdownChart data={demographicsSeries} />
        </ChartCard>
      </div>
    </PageContainer>
  )
}
