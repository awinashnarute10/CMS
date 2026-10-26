import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function KpiCard({
  title,
  value,
  unit,
  subtitle,
  badge,
  comparison,
  icon: Icon,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  className,
}) {
  return (
    <Card className={cn('border border-border bg-card rounded-lg shadow-subtle transition-colors', className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {Icon && (
            <div className="h-8 w-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground shrink-0">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-8 w-24 bg-muted" />
            <Skeleton className="h-4 w-32 bg-muted" />
          </div>
        ) : isError ? (
          <div className="mt-3 flex items-center justify-between gap-2 py-1">
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-medium text-destructive block truncate">
                Unavailable
              </span>
              <p className="text-[11px] text-muted-foreground truncate">
                {errorMessage || 'Failed to load metric'}
              </p>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="text-xs font-medium text-primary hover:underline shrink-0"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground font-mono tabular-nums">
                {value ?? '—'}
              </span>
              {unit && (
                <span className="text-xs text-muted-foreground font-medium">
                  {unit}
                </span>
              )}
            </div>

            {(subtitle || badge || comparison) && (
              <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
                {badge}
                {comparison && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 font-mono font-medium px-1.5 py-0.5 rounded text-[10px]',
                      comparison.trend === 'up'
                        ? 'bg-[var(--status-success-bg)] text-[var(--status-success)] border border-[var(--status-success-border)]'
                        : comparison.trend === 'down'
                        ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger-border)]'
                        : 'bg-secondary text-muted-foreground border border-border'
                    )}
                  >
                    {comparison.delta || comparison.value}
                  </span>
                )}
                {subtitle && (
                  <span className="text-muted-foreground truncate">
                    {subtitle}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
