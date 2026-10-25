import { useState, useMemo, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  UserCheck,
  Footprints,
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

  // Filter in-memory for name/ID search and zone dropdown
  const filteredRecords = useMemo(() => {
    const records = pageData?.records || []
    return records.filter((rec) => {
      if (zoneFilter !== 'all' && rec.zoneId !== zoneFilter) {
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
  }, [pageData?.records, zoneFilter, searchQuery])

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        key: 'personName',
        header: 'Visitor Name',
        className: 'min-w-[160px]',
        render: (val, row) => (
          <div>
            <span className="font-medium text-foreground block">
              {val || 'Anonymous Visitor'}
            </span>
            {row.personId && (
              <span className="text-[11px] text-muted-foreground font-mono block mt-0.5">
                {row.personId}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'gender',
        header: 'Gender',
        className: 'w-[100px]',
        render: (val) => {
          if (!val) return <span className="text-muted-foreground">—</span>
          const normalized = String(val).toLowerCase()
          return (
            <StatusBadge
              status="neutral"
              label={normalized === 'male' ? 'Male' : normalized === 'female' ? 'Female' : val}
              showDot={false}
              className="text-[11px] capitalize"
            />
          )
        },
      },
      {
        key: 'zoneName',
        header: 'Zone Location',
        className: 'min-w-[160px]',
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
        className: 'min-w-[140px]',
        render: (_, row) => {
          const formatted = formatTimestamp(row.entryUtc, row.entryLocal)
          if (!formatted) return <span className="text-muted-foreground">—</span>
          return (
            <div>
              <span className="font-mono text-foreground tabular-nums block">
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
        className: 'min-w-[140px]',
        render: (_, row) => {
          // Do not assume missing exit time means still inside unless contract supports it
          const formatted = formatTimestamp(row.exitUtc, row.exitLocal)
          if (!formatted) {
            return <span className="text-muted-foreground font-mono">—</span>
          }
          return (
            <div>
              <span className="font-mono text-foreground tabular-nums block">
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
        className: 'w-[120px]',
        render: (val) => {
          // Do not calculate dwell time from incomplete data unless explicitly supplied
          if (typeof val === 'number' && !isNaN(val)) {
            return (
              <span className="font-mono text-foreground font-medium tabular-nums">
                {val.toFixed(1)} min
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
        className: 'w-[120px]',
        render: (val) => (
          <StatusBadge
            status={
              val === 'high'
                ? 'danger'
                : val === 'medium'
                ? 'warning'
                : 'neutral'
            }
            label={val ? val.toUpperCase() : 'NORMAL'}
            showDot={false}
          />
        ),
      },
    ],
    []
  )

  return (
    <PageContainer>
      <PageHeader
        title="Crowd Entries & Sessions"
        description={
          selectedSite
            ? `Viewing paginated entry–exit records for ${selectedSite.name}.`
            : 'Combined visitor entry and exit session records.'
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
              className="h-8 px-2.5 text-xs gap-1.5"
              aria-label="Refresh entry logs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-md border border-border bg-card p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Total Logged Records
            </span>
            <span className="text-xl font-semibold text-foreground font-mono tabular-nums mt-0.5 block">
              {totalRecords.toLocaleString()}
            </span>
          </div>
          <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center text-muted-foreground">
            <Footprints className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Page View
            </span>
            <span className="text-xl font-semibold text-foreground font-mono tabular-nums mt-0.5 block">
              {pageNumber} <span className="text-xs text-muted-foreground font-normal">/ {totalPages}</span>
            </span>
          </div>
          <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center text-muted-foreground">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Current Page Records
            </span>
            <span className="text-xl font-semibold text-foreground font-mono tabular-nums mt-0.5 block">
              {filteredRecords.length}
            </span>
          </div>
          <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center text-muted-foreground">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-md border border-border bg-card">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search visitor name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>

        {/* Zone Filter & Page Size Selector */}
        <div className="flex items-center gap-2">
          {selectedSite?.zones && selectedSite.zones.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5 hidden sm:block" />
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger className="h-8 text-xs w-[150px] bg-background">
                  <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {selectedSite.zones.map((z) => (
                    <SelectItem key={z.zoneId} value={z.zoneId}>
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
              <SelectTrigger className="h-8 text-xs w-[75px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
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
        emptyTitle="No Visitor Entries Recorded"
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
