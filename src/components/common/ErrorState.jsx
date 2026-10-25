import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ErrorState({
  title = 'Failed to Load Data',
  message = 'An unexpected error occurred while communicating with the API service.',
  onRetry,
  className,
}) {
  return (
    <div
      className={cn(
        'p-8 rounded-md border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] flex flex-col items-center justify-center text-center space-y-3',
        className
      )}
    >
      <div className="h-9 w-9 rounded-md bg-card border border-[var(--status-danger-border)] flex items-center justify-center text-[var(--status-danger)]">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-[var(--status-danger)]">{title}</h4>
        <p className="text-xs text-muted-foreground max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-8 text-xs gap-1.5 border-[var(--status-danger-border)] text-foreground hover:bg-card"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Retry Request</span>
        </Button>
      )}
    </div>
  )
}
