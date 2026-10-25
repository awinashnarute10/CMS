import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Toaster as Sonner } from 'sonner'

function Toaster({ ...props }) {
  const { resolvedTheme = 'light' } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-4 w-4 text-[var(--status-success)]" />,
        info: <Info className="h-4 w-4 text-[var(--status-info)]" />,
        warning: <TriangleAlert className="h-4 w-4 text-[var(--status-warning)]" />,
        error: <OctagonX className="h-4 w-4 text-[var(--status-danger)]" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-sm group-[.toaster]:rounded-md group-[.toaster]:border',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-secondary group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
