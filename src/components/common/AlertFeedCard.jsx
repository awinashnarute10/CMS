import { ShieldAlert, ShieldCheck, WifiOff, X, Bell } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AlertFeedCard({
  alerts = [],
  status = 'disconnected',
  title = 'Live Security Alerts',
  onDismiss,
  onClear,
  className,
}) {
  const isConnected = status === 'connected'

  return (
    <Card className={cn('border border-border bg-card shadow-none transition-colors flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm md:text-base font-semibold tracking-tight text-foreground flex items-center gap-1.5">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span>{title}</span>
          </CardTitle>
          {alerts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">
              {alerts.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <StatusBadge status="success" label="LIVE" />
          ) : status === 'connecting' ? (
            <StatusBadge status="warning" label="CONNECTING" />
          ) : (
            <StatusBadge status="neutral" label="OFFLINE" />
          )}

          {alerts.length > 0 && onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-1 flex-1 flex flex-col">
        {alerts.length === 0 ? (
          <div className="py-8 my-auto flex flex-col items-center justify-center text-center space-y-2">
            {!isConnected ? (
              <>
                <div className="h-9 w-9 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                  <WifiOff className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  Real-time Telemetry Offline
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  Socket.IO listener will automatically resume receiving live telemetry upon reconnect.
                </p>
              </>
            ) : (
              <>
                <div className="h-9 w-9 rounded-md bg-[var(--status-success-bg)] border border-[var(--status-success-border)] flex items-center justify-center text-[var(--status-success)]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  All Zones Operating Normally
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  Real-time stream connected. Zero active security or density alerts reported across monitored gates.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {alerts.map((alert) => {
              const isHigh = alert.severity === 'high'
              const isMedium = alert.severity === 'medium'

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-3 rounded-md border flex items-start justify-between gap-3 text-xs transition-colors',
                    isHigh
                      ? 'border-[var(--status-danger-border)] bg-[var(--status-danger-bg)]/30'
                      : isMedium
                      ? 'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)]/30'
                      : 'border-border bg-secondary/40'
                  )}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <ShieldAlert
                      className={cn(
                        'h-4 w-4 shrink-0 mt-0.5',
                        isHigh
                          ? 'text-[var(--status-danger)]'
                          : isMedium
                          ? 'text-[var(--status-warning)]'
                          : 'text-muted-foreground'
                      )}
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground truncate">
                          {alert.zoneName || alert.zoneId}
                        </span>
                        {alert.eventType && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-secondary text-muted-foreground font-mono uppercase">
                            {alert.eventType}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-tight">
                        {alert.message}
                      </p>
                      {alert.zoneId && (
                        <span className="text-[10px] text-muted-foreground/75 font-mono block">
                          Zone: {alert.zoneId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1">
                      <StatusBadge
                        status={isHigh ? 'danger' : isMedium ? 'warning' : 'neutral'}
                        label={alert.severity?.toUpperCase() || 'INFO'}
                        showDot={false}
                      />
                      {onDismiss && (
                        <button
                          type="button"
                          onClick={() => onDismiss(alert.id)}
                          className="h-5 w-5 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label="Dismiss alert"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {alert.timestamp && (
                      <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                        {alert.timestamp}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
