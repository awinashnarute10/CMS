import { useState, useMemo, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { TimeRangeSelector, computeRangeFromPreset } from '@/components/common/TimeRangeSelector'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSite } from '@/context/SiteContext'
import { useEntryExitQuery, analyticsKeys } from '@/hooks/useAnalytics'
import { getEntryExitRecords } from '@/api/analytics'
import { formatDwellDuration, cn } from '@/lib/utils'

function formatTimestamp(utcMs, localFallback) {
  if (typeof utcMs === 'number' && !isNaN(utcMs)) {
    const d = new Date(utcMs)
    return {
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      date: d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    }
  }
  if (localFallback) {
    return { time: localFallback, date: '' }
  }
  return null
}

export function CrowdEntriesPage() {
  const { selectedSite, selectedSiteId } = useSite()
  const [timePreset, setTimePreset] = useState('24h')
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [searchQuery, setSearchQuery] = useState('')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'inside' | 'exited'

  const { fromUtc, toUtc } = useMemo(
    () => computeRangeFromPreset(timePreset),
    [timePreset]
  )

  // Reset to page 1 whenever time range or page size changes
  const handleTimePresetChange = (preset) => {
    setTimePreset(preset)
    setPageNumber(1)
  }

  const handlePageSizeChange = (sizeStr) => {
    setPageSize(Number(sizeStr))
    setPageNumber(1)
  }

  const {
    data: pageData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useEntryExitQuery({
    siteId: selectedSiteId,
    fromUtc,
    toUtc,
    pageSize,
    pageNumber,
    enabled: Boolean(selectedSiteId),
  })

  const totalRecords = pageData?.totalRecords ?? 0
  const totalPages = pageData?.totalPages || (totalRecords > 0 ? Math.ceil(totalRecords / pageSize) : 1)

  // Derive counts of visitors currently inside vs completed visits
  const insideCount = useMemo(() => {
    return (pageData?.records || []).filter((r) => r.exitUtc == null).length
  }, [pageData?.records])

  const exitedCount = useMemo(() => {
    return (pageData?.records || []).filter((r) => r.exitUtc != null).length
  }, [pageData?.records])

  const queryClient = useQueryClient()

  // Eliminate pagination request waterfall: prefetch adjacent page into TanStack Query cache
  useEffect(() => {
    if (pageNumber < totalPages && selectedSiteId) {
      queryClient.prefetchQuery({
        queryKey: analyticsKeys.entryExit({
          siteId: selectedSiteId,
          fromUtc,
          toUtc,
          pageSize,
          pageNumber: pageNumber + 1,
        }),
        queryFn: ({ signal }) =>
          getEntryExitRecords(
            { siteId: selectedSiteId, fromUtc, toUtc, pageSize, pageNumber: pageNumber + 1 },
            { signal }
          ),
        staleTime: 1000 * 30,
      })
    }
  }, [pageNumber, totalPages, selectedSiteId, fromUtc, toUtc, pageSize, queryClient])

  // Filter in-memory for name/ID search, zone dropdown, and visit status (still inside vs exited)
  const filteredRecords = useMemo(() => {
    const records = pageData?.records || []
    return records.filter((rec) => {
      if (zoneFilter !== 'all' && rec.zoneId !== zoneFilter) {
        return false
      }
      if (statusFilter === 'inside' && rec.exitUtc != null) {
        return false
      }
      if (statusFilter === 'exited' && rec.exitUtc == null) {
        return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const nameMatch = rec.personName?.toLowerCase().includes(query)
        const idMatch = rec.personId?.toLowerCase().includes(query)
        return nameMatch || idMatch
      }
      return true
    })
  }, [pageData?.records, zoneFilter, statusFilter, searchQuery])

  // Table columns definition with small circular user avatar, readable dark values, aligned columns
  const columns = useMemo(
    () => [
      {
        key: 'personName',
        header: 'Visitor Name',
        className: 'min-w-[200px]',
        render: (val, row) => {
          const name = val || 'Anonymous Visitor'
          const initials = name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
          return (
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-secondary border border-border text-primary font-semibold text-[11px] flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-foreground block truncate">
                  {name}
                </span>
                {row.personId && (
                  <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
                    {row.personId}
                  </span>
                )}
              </div>
            </div>
          )
        },
      },
      {
        key: 'status',
        header: 'Visit Status',
        className: 'w-[130px]',
        render: (_, row) => {
          const isInside = row.exitUtc == null
          return (
            <StatusBadge
              status={isInside ? 'success' : 'neutral'}
              label={isInside ? 'Still Inside' : 'Completed'}
              showDot={isInside}
            />
          )
        },
      },
      {
        key: 'gender',
        header: 'Gender',
        className: 'w-[90px]',
        render: (val) => {
          if (!val) return <span className="text-muted-foreground">—</span>
          const normalized = String(val).toLowerCase()
          return (
            <span className="text-foreground capitalize font-medium">
              {normalized === 'male' ? 'Male' : normalized === 'female' ? 'Female' : val}
            </span>
          )
        },
      },
      {
        key: 'zoneName',
        header: 'Zone Location',
        className: 'min-w-[150px]',
        render: (val, row) => (
          <div>
            <span className="text-foreground font-medium block">{val || '—'}</span>
            {row.zoneId && (
              <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                {row.zoneId}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'entryLocal',
        header: 'Entry Time',
        className: 'min-w-[130px]',
        render: (_, row) => {
          const formatted = formatTimestamp(row.entryUtc, row.entryLocal)
          if (!formatted) return <span className="text-muted-foreground">—</span>
          return (
            <div>
              <span className="font-mono text-foreground font-medium tabular-nums block">
                {formatted.time}
              </span>
              {formatted.date && (
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  {formatted.date}
                </span>
              )}
            </div>
          )
        },
      },
      {
        key: 'exitLocal',
        header: 'Exit Time',
        className: 'min-w-[130px]',
        render: (_, row) => {
          if (row.exitUtc == null) {
            return (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--status-success)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)] animate-pulse" />
                Active inside
              </span>
            )
          }
          const formatted = formatTimestamp(row.exitUtc, row.exitLocal)
          if (!formatted) {
            return <span className="text-muted-foreground font-mono">—</span>
          }
          return (
            <div>
              <span className="font-mono text-foreground font-medium tabular-nums block">
                {formatted.time}
              </span>
              {formatted.date && (
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  {formatted.date}
                </span>
              )}
            </div>
          )
        },
      },
      {
        key: 'dwellMinutes',
        header: 'Dwell Time',
        align: 'right',
        className: 'w-[130px]',
        render: (val) => {
          const formatted = formatDwellDuration(val)
          if (formatted) {
            return (
              <span className="font-mono text-foreground font-medium tabular-nums">
                {formatted}
              </span>
            )
          }
          return <span className="text-muted-foreground font-mono">—</span>
        },
      },
      {
        key: 'severity',
        header: 'Security Level',
        align: 'center',
        className: 'w-[110px]',
        render: (val) => {
          const sev = val === 'high' ? 'high' : val === 'medium' ? 'medium' : 'low'
          return (
            <StatusBadge
              status={sev}
              label={sev.toUpperCase()}
              showDot={false}
            />
          )
        },
      },
    ],
    []
  )

  return (
    <PageContainer>
      <PageHeader
        title="Crowd Entries"
        description={
          selectedSite
            ? `Viewing paginated entry–exit records for ${selectedSite.name}.`
            : 'Visitor entry and exit session records.'
        }
        badge={
          selectedSite ? (
            <StatusBadge status="neutral" label={`${selectedSite.zones?.length || 0} Zones`} />
          ) : null
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <TimeRangeSelector
              value={timePreset}
              onChange={handleTimePresetChange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-9 px-3 text-xs gap-1.5 bg-card border-border text-foreground hover:border-primary hover:text-primary rounded-lg shadow-subtle transition-colors"
              aria-label="Refresh entry logs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-primary' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
      />

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-card shadow-subtle">
        {/* Left: Search & Status Segmented Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search visitor name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Quick Status Filter: All / Still Inside / Completed */}
          <div className="inline-flex items-center bg-secondary/80 p-0.5 rounded-lg border border-border text-xs shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors font-medium text-xs',
                statusFilter === 'all'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All ({pageData?.records?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inside')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors font-medium text-xs flex items-center gap-1.5',
                statusFilter === 'inside'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)]" />
              Still Inside ({insideCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('exited')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors font-medium text-xs',
                statusFilter === 'exited'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Completed ({exitedCount})
            </button>
          </div>
        </div>

        {/* Zone Filter & Page Size Selector */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          {selectedSite?.zones && selectedSite.zones.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5 hidden sm:block" />
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger className="h-9 text-xs w-[150px] bg-card border-border text-foreground rounded-lg hover:border-primary">
                  <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border shadow-md rounded-lg">
                  <SelectItem value="all" className="focus:bg-accent focus:text-accent-foreground">All Zones</SelectItem>
                  {selectedSite.zones.map((z) => (
                    <SelectItem key={z.zoneId} value={z.zoneId} className="focus:bg-accent focus:text-accent-foreground">
                      {z.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="hidden md:inline">Rows:</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-9 text-xs w-[75px] bg-card border-border text-foreground rounded-lg hover:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border shadow-md rounded-lg">
                <SelectItem value="25" className="focus:bg-accent focus:text-accent-foreground">25</SelectItem>
                <SelectItem value="50" className="focus:bg-accent focus:text-accent-foreground">50</SelectItem>
                <SelectItem value="100" className="focus:bg-accent focus:text-accent-foreground">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Table with Server Pagination */}
      <DataTable
        columns={columns}
        data={filteredRecords}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={error?.message}
        onRetry={() => refetch()}
        emptyTitle="No visitor records found"
        emptyDescription={
          searchQuery
            ? 'No records match your search filter on this page.'
            : 'No entry/exit activity recorded for this site during the selected time period.'
        }
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={setPageNumber}
      />
    </PageContainer>
  )
}
