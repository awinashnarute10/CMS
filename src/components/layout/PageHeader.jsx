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
        'flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-[#D9DCDD]',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#202124]">
            {title}
          </h2>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-[#777B80] leading-relaxed">
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
