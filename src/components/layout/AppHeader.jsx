import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteSelector } from '@/components/common/SiteSelector'
import { SimulationControl } from '@/components/common/SimulationControl'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { UserMenu } from '@/components/common/UserMenu'
import { StatusBadge } from '@/components/common/StatusBadge'

export function AppHeader({
  title = 'Crowd Management',
  onOpenMobileNav,
  user = null,
  connectionStatus = null,
}) {
  return (
    <header className="h-14 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 md:hidden text-foreground"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold tracking-tight text-foreground hidden sm:inline">
          {title}
        </span>
      </div>

      {/* Center: Global Site Selector */}
      <div className="flex-1 max-w-xs md:max-w-sm">
        <SiteSelector />
      </div>

      {/* Right: Simulation Controls, Theme, User */}
      <div className="flex items-center gap-2.5">
        <SimulationControl className="hidden sm:flex" />

        {connectionStatus && (
          <StatusBadge
            status={connectionStatus === 'connected' ? 'success' : 'neutral'}
            label={connectionStatus === 'connected' ? 'Live' : 'Offline'}
            className="hidden lg:inline-flex"
          />
        )}

        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  )
}
