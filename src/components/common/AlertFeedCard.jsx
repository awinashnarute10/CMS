import { ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { cn } from '@/lib/utils'

export function AlertFeedCard({
  alerts = [],
  title = 'Active Zone Alerts',
  className,
}) {
  return (
    <Card className={cn('border border-border bg-card shadow-none transition-colors', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm md:text-base font-semibold tracking-tight text-foreground">
            {title}
          </CardTitle>
          {alerts.length > 0 ? (
            <StatusBadge status="warning" label={`${alerts.length} Active`} />
          ) : (
            <StatusBadge status="success" label="All Normal" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        {alerts.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <div className="h-8 w-8 rounded-md bg-[var(--status-success-bg)] border border-[var(--status-success-border)] flex items-center justify-center text-[var(--status-success)]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium text-foreground">
              No Operational Alerts
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              All monitored zones and access gates are currently operating within established parameters.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div
                key={alert.id || `alert-${idx}`}
                className="p-3 rounded-md border border-border bg-secondary/40 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-[var(--status-warning)] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">
                      {alert.zoneName || alert.zoneId || 'Monitored Zone'}
                    </p>
                    <p className="text-muted-foreground">{alert.message || alert.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge
                    status={alert.severity === 'high' ? 'danger' : 'warning'}
                    label={alert.severity ? alert.severity.toUpperCase() : 'ALERT'}
                  />
                  {alert.timestamp && (
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {alert.timestamp}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
