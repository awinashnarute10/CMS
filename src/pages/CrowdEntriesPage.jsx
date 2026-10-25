import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { TimeRangeSelector } from '@/components/common/TimeRangeSelector'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useSite } from '@/context/SiteContext'

const COLUMNS = [
  {
    key: 'personId',
    header: 'Person ID',
    className: 'font-mono text-muted-foreground w-[120px]',
  },
  {
    key: 'personName',
    header: 'Full Name',
    className: 'font-medium text-foreground',
  },
  {
    key: 'zoneName',
    header: 'Zone Location',
    render: (val, row) => (
      <div>
        <span className="text-foreground">{val || '—'}</span>
        {row.zoneId && (
          <span className="text-[10px] text-muted-foreground font-mono block">
            {row.zoneId}
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'entryLocal',
    header: 'Entry Time',
    className: 'tabular-nums',
  },
  {
    key: 'exitLocal',
    header: 'Exit Time',
    className: 'tabular-nums',
  },
  {
    key: 'dwellMinutes',
    header: 'Dwell (min)',
    className: 'tabular-nums text-right',
    align: 'right',
    render: (val) => (typeof val === 'number' ? `${val.toFixed(1)} min` : 'Active'),
  },
  {
    key: 'severity',
    header: 'Security Level',
    render: (val) => (
      <StatusBadge
        status={val === 'high' ? 'danger' : val === 'medium' ? 'warning' : 'neutral'}
        label={val ? val.toUpperCase() : 'NORMAL'}
        showDot={false}
      />
    ),
  },
]

export function CrowdEntriesPage() {
  const { selectedSite } = useSite()
  const [timePreset, setTimePreset] = useState('24h')

  return (
    <PageContainer>
      <PageHeader
        title="Crowd Entries & Sessions"
        description={
          selectedSite
            ? `Viewing combined entry–exit logs for ${selectedSite.name}.`
            : 'Combined entry–exit session logs and visitor dwell tracking.'
        }
        actions={
          <TimeRangeSelector
            value={timePreset}
            onChange={setTimePreset}
          />
        }
      />

      <DataTable
        columns={COLUMNS}
        data={[]}
        isLoading={false}
        emptyTitle="No Entry–Exit Logs Available"
        emptyDescription="Start the live occupancy simulator or select a time range with recorded sessions to stream log data."
      />
    </PageContainer>
  )
}
