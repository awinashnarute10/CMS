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
        'p-8 rounded-lg border border-[#F5C6C6] bg-[#FDF0F0] flex flex-col items-center justify-center text-center space-y-3',
        className
      )}
    >
      <div className="h-9 w-9 rounded-lg bg-white border border-[#F5C6C6] flex items-center justify-center text-[#C62828]">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-[#C62828]">{title}</h4>
        <p className="text-xs text-[#777B80] max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-8 text-xs gap-1.5 border-[#F5C6C6] bg-white text-[#202124] hover:bg-[#FDF0F0] rounded-lg shadow-subtle"
        >
          <RotateCcw className="h-3.5 w-3.5 text-[#C62828]" />
          <span>Retry Request</span>
        </Button>
      )}
    </div>
  )
}
