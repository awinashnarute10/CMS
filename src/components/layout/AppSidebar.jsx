import { LayoutDashboard, Users, Radio, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    id: 'crowd-entries',
    label: 'Crowd Entries',
    icon: Users,
  },
]

export function AppSidebar({
  activeTab = 'overview',
  onSelectTab,
  mobileOpen = false,
  onCloseMobile,
  className,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col transition-transform duration-200 md:static md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        aria-label="Main Navigation"
      >
        {/* Brand / Header */}
        <div className="h-14 px-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-wider">
              CM
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Crowd Ops
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                Enterprise
              </span>
            </div>
          </div>
          {mobileOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden text-muted-foreground"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab?.(item.id)
                  onCloseMobile?.()
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-secondary text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && (
                  <span
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-l"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Operational System Status Footer */}
        <div className="p-4 border-t border-border bg-card">
          <div className="p-3 rounded-md bg-secondary/70 border border-border flex items-center gap-2.5 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">System Engine</span>
              <span className="text-[11px] text-muted-foreground">Node Socket SSE v1.1</span>
            </div>
            <Radio className="h-3.5 w-3.5 text-primary ml-auto" />
          </div>
        </div>
      </aside>
    </>
  )
}
