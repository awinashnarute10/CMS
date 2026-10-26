import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoadingState({
  message = 'Loading analytics data...',
  className,
  inline = false,
}) {
  if (inline) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-[#777B80]', className)}>
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0B8F8B]" />
        <span>{message}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'p-12 flex flex-col items-center justify-center text-center space-y-3',
        className
      )}
    >
      <div className="h-10 w-10 rounded-lg bg-[#E8F5F4] border border-[#BFE3E1] flex items-center justify-center text-[#0B8F8B]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
      <p className="text-xs font-medium text-[#777B80]">{message}</p>
    </div>
  )
}
