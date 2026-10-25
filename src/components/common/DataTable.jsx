import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  isError = false,
  errorMessage,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items recorded for this query.',
  pageNumber = 1,
  totalPages = 1,
  totalRecords,
  onPageChange,
  className,
}) {
  if (isError) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              {columns.map((col) => (
                <TableHead
                  key={col.key || col.header}
                  className={cn(
                    'h-10 text-xs font-semibold text-muted-foreground uppercase tracking-wider',
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
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, rIdx) => (
                <TableRow key={`skeleton-row-${rIdx}`} className="border-b border-border">
                  {columns.map((col, cIdx) => (
                    <TableCell key={`skeleton-cell-${cIdx}`} className="py-3">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
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
                  key={row.id || row.personId || `row-${rowIdx}`}
                  className="border-b border-border hover:bg-secondary/40 transition-colors"
                >
                  {columns.map((col) => {
                    const value = row[col.key]
                    return (
                      <TableCell
                        key={col.key || col.header}
                        className={cn(
                          'py-3 text-xs text-foreground',
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

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
          <div>
            {typeof totalRecords === 'number' && (
              <span>
                Total <strong className="text-foreground tabular-nums">{totalRecords}</strong> records
              </span>
            )}
            <span className="ml-2">
              Page <strong className="text-foreground tabular-nums">{pageNumber}</strong> of{' '}
              <strong className="text-foreground tabular-nums">{totalPages}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber <= 1 || isLoading}
              onClick={() => onPageChange?.(pageNumber - 1)}
              className="h-8 px-2.5 text-xs gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pageNumber >= totalPages || isLoading}
              onClick={() => onPageChange?.(pageNumber + 1)}
              className="h-8 px-2.5 text-xs gap-1"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
