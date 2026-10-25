import { cn } from '@/lib/utils'

export function PageContainer({ className, children, ...props }) {
  return (
    <div
      className={cn('w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}
