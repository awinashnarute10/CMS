import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  high: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA] dark:bg-[#450A0A]/80 dark:text-[#F87171] dark:border-[#7F1D1D]',
  medium: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] dark:bg-[#451A03]/80 dark:text-[#FBBF24] dark:border-[#78350F]',
  low: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] dark:bg-[#052E16] dark:text-[#4ADE80] dark:border-[#166534]',
  neutral: 'bg-secondary/60 text-muted-foreground border-border',
  danger: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA] dark:bg-[#450A0A]/80 dark:text-[#F87171] dark:border-[#7F1D1D]',
  warning: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] dark:bg-[#451A03]/80 dark:text-[#FBBF24] dark:border-[#78350F]',
  success: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC] dark:bg-[#052E16] dark:text-[#4ADE80] dark:border-[#166534]',
}

const DOT_STYLES = {
  high: 'bg-[#DC2626] dark:bg-[#F87171]',
  medium: 'bg-[#D97706] dark:bg-[#FBBF24]',
  low: 'bg-[#16A34A] dark:bg-[#4ADE80]',
  neutral: 'bg-muted-foreground',
  danger: 'bg-[#DC2626] dark:bg-[#F87171]',
  warning: 'bg-[#D97706] dark:bg-[#FBBF24]',
  success: 'bg-[#16A34A] dark:bg-[#4ADE80]',
}

export function StatusBadge({
  status = 'neutral',
  label,
  children,
  showDot = true,
  className,
}) {
  const normalizedKey = typeof status === 'string' ? status.toLowerCase() : 'neutral'
  const styleClass = STATUS_STYLES[normalizedKey] || STATUS_STYLES.neutral
  const dotClass = DOT_STYLES[normalizedKey] || DOT_STYLES.neutral
  const content = label || children

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border tracking-tight',
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
