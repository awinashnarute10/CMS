import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  success: 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success-border)]',
  warning: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]',
  danger: 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger-border)]',
  info: 'bg-[var(--status-info-bg)] text-[var(--status-info)] border-[var(--status-info-border)]',
  neutral: 'bg-secondary text-muted-foreground border-border',
}

const DOT_STYLES = {
  success: 'bg-[var(--status-success)]',
  warning: 'bg-[var(--status-warning)]',
  danger: 'bg-[var(--status-danger)]',
  info: 'bg-[var(--status-info)]',
  neutral: 'bg-muted-foreground',
}

export function StatusBadge({
  status = 'neutral',
  label,
  children,
  showDot = true,
  className,
}) {
  const styleClass = STATUS_STYLES[status] || STATUS_STYLES.neutral
  const dotClass = DOT_STYLES[status] || DOT_STYLES.neutral
  const content = label || children

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border tracking-tight',
        styleClass,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotClass)}
          aria-hidden="true"
        />
      )}
      <span>{content}</span>
    </span>
  )
}
