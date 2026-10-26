import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({
  title = 'No Data Available',
  description = 'There are no records matching your current filter criteria.',
  icon: Icon = Inbox,
  action = null,
  className,
}) {
  return (
    <div
      className={cn(
        'p-12 flex flex-col items-center justify-center text-center space-y-3',
        className
      )}
    >
      <div className="h-10 w-10 rounded-lg bg-[#F6F7F8] border border-[#D9DCDD] flex items-center justify-center text-[#777B80]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-[#202124]">{title}</h3>
        {description && (
          <p className="text-xs text-[#777B80] max-w-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
