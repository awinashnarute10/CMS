import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { cn } from '@/lib/utils'

export function ChartCard({
  title,
  description,
  badge,
  actions,
  children,
  isLoading = false,
  isEmpty = false,
  isError = false,
  errorMessage,
  onRetry,
  className,
  contentClassName,
}) {
  return (
    <Card className={cn('border border-border bg-card shadow-none transition-colors', className)}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm md:text-base font-semibold tracking-tight text-foreground">
              {title}
            </CardTitle>
            {badge}
          </div>
          {description && (
            <CardDescription className="text-xs text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </CardHeader>
      <CardContent className={cn('pt-1', contentClassName)}>
        {isLoading ? (
          <div className="h-[280px] flex items-center justify-center">
            <LoadingState message="Rendering analytics series..." />
          </div>
        ) : isError ? (
          <div className="h-[280px] flex items-center justify-center p-4">
            <ErrorState message={errorMessage} onRetry={onRetry} />
          </div>
        ) : isEmpty ? (
          <div className="h-[280px] flex items-center justify-center">
            <EmptyState title="No chart data" description="No simulation activity recorded in this time range." />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
