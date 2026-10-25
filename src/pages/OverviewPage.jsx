import { useState } from 'react'
import { Users, Footprints, Clock, ShieldAlert } from 'lucide-react'


import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { KpiCard } from '@/components/common/KpiCard'
import { TimeRangeSelector } from '@/components/common/TimeRangeSelector'
import { ChartCard } from '@/components/common/ChartCard'
import { AlertFeedCard } from '@/components/common/AlertFeedCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useSite } from '@/context/SiteContext'

export function OverviewPage() {
  const { selectedSite, isLoading } = useSite()
  const [timePreset, setTimePreset] = useState('24h')

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
        <KpiCard
          title="Current Site Occupancy"
          value={null}
          unit="persons"
          icon={Users}
          isLoading={isLoading}
          subtitle="Waiting for simulator stream"
        />
        <KpiCard
          title="Hourly Footfall Rate"
          value={null}
          unit="entries/hr"
          icon={Footprints}
          isLoading={isLoading}
          subtitle="Awaiting analytics data"
        />
        <KpiCard
          title="Average Dwell Duration"
          value={null}
          unit="minutes"
          icon={Clock}
          isLoading={isLoading}
          subtitle="No recorded sessions yet"
        />
        <KpiCard
          title="Active Security Alerts"
          value={0}
          unit="alerts"
          icon={ShieldAlert}
          isLoading={isLoading}
          badge={<StatusBadge status="success" label="Optimal" />}
        />
      </div>

      {/* Grid: Charts & Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Hourly Occupancy & Entry Distribution"
          description="Aggregated simulation time-series by hour in UTC"
          className="lg:col-span-2"
          isEmpty={true}
        />
        <AlertFeedCard
          alerts={[]}
          title="Active Zone Alerts"
        />
      </div>

      {/* Monitored Zones Breakdown (if site selected) */}
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
                    status={zone.securityLevel === 'high' ? 'danger' : zone.securityLevel === 'medium' ? 'warning' : 'neutral'}
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
