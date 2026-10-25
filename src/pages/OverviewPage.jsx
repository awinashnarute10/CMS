import { useState, useMemo } from 'react'
import { Users, Footprints, Clock, ShieldCheck, Radio } from 'lucide-react'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { KpiCard } from '@/components/common/KpiCard'
import { TimeRangeSelector, computeRangeFromPreset } from '@/components/common/TimeRangeSelector'
import { ChartCard } from '@/components/common/ChartCard'
import { AlertFeedCard } from '@/components/common/AlertFeedCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { OccupancyTimeChart } from '@/components/charts/OccupancyTimeChart'
import { DemographicsTrendChart } from '@/components/charts/DemographicsTrendChart'
import { DemographicsBreakdownChart } from '@/components/charts/DemographicsBreakdownChart'
import { useSite } from '@/context/SiteContext'
import {
  useOccupancyQuery,
  useTodaysFootfallQuery,
  useDwellQuery,
  useDemographicsQuery,
} from '@/hooks/useAnalytics'

function extractSeries(response) {
  if (!response) return []
  if (Array.isArray(response)) return response
  if (Array.isArray(response.records)) return response.records
  if (Array.isArray(response.buckets)) return response.buckets
  if (Array.isArray(response.data)) return response.data
  if (Array.isArray(response.occupancy)) return response.occupancy
  if (Array.isArray(response.demographics)) return response.demographics
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

  return (
    <PageContainer>
      <PageHeader
        title="Overview Dashboard"
        description={
          selectedSite
            ? `Monitoring ${selectedSite.name} (${selectedSite.city}, ${selectedSite.country}) • Timezone: ${selectedSite.timezone}`
            : 'Real-time crowd analytics and zone occupancy monitoring.'
        }
        badge={
          selectedSite ? (
            <StatusBadge status="neutral" label={`${selectedSite.zones?.length || 0} Zones`} />
          ) : null
        }
        actions={
          <TimeRangeSelector
            value={timePreset}
            onChange={setTimePreset}
          />
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Live Occupancy */}
        <KpiCard
          title="Live Site Occupancy"
          value={liveOccupancy}
          unit="persons"
          icon={Users}
          isLoading={occupancyQuery.isLoading || isLoadingSite}
          subtitle={
            isLiveStreamActive
              ? 'Real-time telemetry active'
              : occupancySeries.length > 0
              ? 'Latest recorded bucket'
              : 'Waiting for simulator stream'
          }
          badge={
            isLiveStreamActive ? (
              <StatusBadge status="success" label="LIVE" icon={Radio} />
            ) : occupancySeries.length > 0 ? (
              <StatusBadge status="neutral" label="RECORDED" />
            ) : null
          }
        />

        {/* KPI 2: Today's Footfall */}
        <KpiCard
          title="Today's Footfall"
          value={footfallQuery.data?.footfall != null ? footfallQuery.data.footfall.toLocaleString() : null}
          unit="entries"
          icon={Footprints}
          isLoading={footfallQuery.isLoading || isLoadingSite}
          subtitle="Cumulative entries since 00:00 UTC"
        />

        {/* KPI 3: Average Dwell Time */}
        <KpiCard
          title="Average Dwell Time"
          value={dwellQuery.data?.avgDwellMinutes != null ? `${dwellQuery.data.avgDwellMinutes}` : null}
          unit="minutes"
          icon={Clock}
          isLoading={dwellQuery.isLoading || isLoadingSite}
          subtitle={
            dwellQuery.data?.dwellRecords
              ? `Based on ${dwellQuery.data.dwellRecords.toLocaleString()} recorded visits`
              : 'Across selected period'
          }
        />

        {/* KPI 4: Monitored Security Zones */}
        <KpiCard
          title="Monitored Zones"
          value={selectedSite?.zones?.length ?? 0}
          unit="zones"
          icon={ShieldCheck}
          isLoading={isLoadingSite}
          subtitle={selectedSite ? `Site: ${selectedSite.siteId}` : 'Awaiting site selection'}
          badge={<StatusBadge status="success" label="Online" />}
        />
      </div>

      {/* Primary Analytics Section: Occupancy Time-Series & Demographics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Occupancy Over Time"
          description="Hourly crowd distribution within the selected observation window"
          className="lg:col-span-2"
          isLoading={occupancyQuery.isLoading}
          isError={occupancyQuery.isError}
          errorMessage={occupancyQuery.error?.message}
          onRetry={() => occupancyQuery.refetch()}
          isEmpty={occupancySeries.length === 0}
        >
          <OccupancyTimeChart data={occupancySeries} />
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

      {/* Secondary Analytics Section: Demographics Trend & Alert Feed */}
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

        <AlertFeedCard
          alerts={[]}
          title="Active Security Alerts"
        />
      </div>

      {/* Monitored Zones Breakdown Table */}
      {selectedSite?.zones && selectedSite.zones.length > 0 && (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Configured Zones ({selectedSite.zones.length})
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              Site ID: {selectedSite.siteId}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedSite.zones.map((zone) => (
              <div
                key={zone.zoneId}
                className="p-3 rounded-md bg-secondary/40 border border-border flex flex-col justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-semibold text-foreground">{zone.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{zone.zoneId}</p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                  <span className="text-muted-foreground">Security</span>
                  <StatusBadge
                    status={
                      zone.securityLevel === 'high'
                        ? 'danger'
                        : zone.securityLevel === 'medium'
                        ? 'warning'
                        : 'neutral'
                    }
                    label={zone.securityLevel ? zone.securityLevel.toUpperCase() : 'NORMAL'}
                    showDot={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  )
}
