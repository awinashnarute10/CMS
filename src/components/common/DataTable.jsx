import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { cn } from '@/lib/utils'

export function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  isFetching = false,
  isError = false,
  errorMessage,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items recorded for this query.',
  pageNumber = 1,
  pageSize = 50,
  totalPages = 1,
  totalRecords,
  onPageChange,
  className,
}) {
  if (isError) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 flex items-center justify-center shadow-subtle">
        <ErrorState message={errorMessage} onRetry={onRetry} />
      </div>
    )
  }

  const startRecord = typeof totalRecords === 'number' && totalRecords > 0
    ? (pageNumber - 1) * pageSize + 1
    : 0
  const endRecord = typeof totalRecords === 'number'
    ? Math.min(pageNumber * pageSize, totalRecords)
    : 0

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative rounded-lg border border-border bg-card shadow-subtle overflow-hidden">
        {/* Subtle background fetching progress banner */}
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20 overflow-hidden z-10">
            <div className="h-full bg-primary animate-pulse w-full" />
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border bg-muted/60">
                {columns.map((col) => (
                  <TableHead
                    key={col.key || col.header}
                    className={cn(
                      'h-11 px-4 text-xs font-bold text-foreground uppercase tracking-wider',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.className
                    )}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className={cn(isFetching && !isLoading && 'opacity-70 transition-opacity')}>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, rIdx) => (
                  <TableRow key={`skeleton-row-${rIdx}`} className="border-b border-border">
                    {columns.map((col, cIdx) => (
                      <TableCell key={`skeleton-cell-${cIdx}`} className="py-3.5 px-4">
                        <Skeleton className="h-4 w-full max-w-[120px] bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="p-0">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIdx) => (
                  <TableRow
                    key={row.personId ? `${row.personId}-${row.entryUtc || rowIdx}` : `row-${rowIdx}`}
                    className="border-b border-border hover:bg-muted/40 transition-colors"
                  >
                    {columns.map((col) => {
                      const value = row[col.key]
                      return (
                        <TableCell
                          key={col.key || col.header}
                          className={cn(
                            'py-3.5 px-4 text-xs text-foreground',
                            col.align === 'right' && 'text-right',
                            col.align === 'center' && 'text-center',
                            col.className
                          )}
                        >
                          {col.render ? col.render(value, row, rowIdx) : value ?? '—'}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {typeof totalRecords === 'number' && totalRecords > 0 ? (
            <span>
              Showing <strong className="text-foreground font-mono tabular-nums">{startRecord}</strong>–
              <strong className="text-foreground font-mono tabular-nums">{endRecord}</strong> of{' '}
              <strong className="text-foreground font-mono tabular-nums">{totalRecords.toLocaleString()}</strong> records
            </span>
          ) : typeof totalRecords === 'number' ? (
            <span>0 records found</span>
          ) : null}

          {isFetching && !isLoading && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground ml-2">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span>Updating...</span>
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <span className="mr-2 text-xs">
              Page <strong className="text-foreground font-mono tabular-nums">{pageNumber}</strong> of{' '}
              <strong className="text-foreground font-mono tabular-nums">{totalPages}</strong>
            </span>

            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber <= 1 || isLoading}
              onClick={() => onPageChange?.(1)}
              className="h-8 w-8 p-0 bg-card border-border text-foreground hover:border-primary hover:text-primary rounded-lg shadow-subtle"
              aria-label="Go to first page"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber <= 1 || isLoading}
              onClick={() => onPageChange?.(pageNumber - 1)}
              className="h-8 px-2.5 text-xs gap-1 bg-card border-border text-foreground hover:border-primary hover:text-primary rounded-lg shadow-subtle"
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber >= totalPages || isLoading}
              onClick={() => onPageChange?.(pageNumber + 1)}
              className="h-8 px-2.5 text-xs gap-1 bg-card border-border text-foreground hover:border-primary hover:text-primary rounded-lg shadow-subtle"
              aria-label="Go to next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber >= totalPages || isLoading}
              onClick={() => onPageChange?.(totalPages)}
              className="h-8 w-8 p-0 bg-card border-border text-foreground hover:border-primary hover:text-primary rounded-lg shadow-subtle"
              aria-label="Go to last page"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
