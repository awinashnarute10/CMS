import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function KpiCard({
  title,
  value,
  unit,
  subtitle,
  badge,
  icon: Icon,
  isLoading = false,
  className,
}) {
  return (
    <Card className={cn('border border-border bg-card shadow-none transition-colors', className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {Icon && (
            <div className="h-8 w-8 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                {value ?? '—'}
              </span>
              {unit && (
                <span className="text-xs text-muted-foreground font-medium">
                  {unit}
                </span>
              )}
            </div>

            {(subtitle || badge) && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                {badge}
                {subtitle && (
                  <span className="text-muted-foreground">
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
