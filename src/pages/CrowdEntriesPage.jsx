import { useState, useMemo, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'

import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { getRolling24hRange } from '@/components/common/TimeRangeSelector'
import { Button } from '@/components/ui/button'
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
import { formatDwellDuration } from '@/lib/utils'

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
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const { fromUtc, toUtc } = useMemo(
    () => getRolling24hRange(),
    []
  )

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

  // Table columns definition strictly adhering to PRD 5.3:
  // Visitor name, Gender, Entry time, Exit time, Dwell time
  const columns = useMemo(
    () => [
      {
        key: 'personName',
        header: 'Visitor Name',
        className: 'min-w-[200px]',
        render: (val) => {
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
              <span className="font-semibold text-foreground truncate">
                {name}
              </span>
            </div>
          )
        },
      },
      {
        key: 'gender',
        header: 'Gender',
        className: 'w-[100px]',
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
        key: 'entryLocal',
        header: 'Entry Time',
        className: 'min-w-[150px]',
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
        className: 'min-w-[150px]',
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
        className: 'w-[140px]',
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
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Rows:</span>
              <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="h-9 text-xs w-[75px] bg-card border-border text-foreground rounded-lg hover:border-primary shadow-subtle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border shadow-md rounded-lg">
                  <SelectItem value="25" className="focus:bg-accent focus:text-accent-foreground">25</SelectItem>
                  <SelectItem value="50" className="focus:bg-accent focus:text-accent-foreground">50</SelectItem>
                  <SelectItem value="100" className="focus:bg-accent focus:text-accent-foreground">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

      {/* Data Table with Server Pagination */}
      <DataTable
        columns={columns}
        data={pageData?.records || []}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={error?.message}
        onRetry={() => refetch()}
        emptyTitle="No visitor records found"
        emptyDescription="No entry/exit activity recorded for this site during the selected time period."
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={setPageNumber}
      />
    </PageContainer>
  )
}
