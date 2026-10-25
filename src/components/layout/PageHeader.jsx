import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-border/60',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
