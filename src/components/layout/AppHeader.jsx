import { Menu, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { UserMenu } from '@/components/common/UserMenu'
import { StatusBadge } from '@/components/common/StatusBadge'

export function AppHeader({
  title = 'Crowd Management',
  activeSiteName = null,
  onOpenMobileNav,
  user = null,
  connectionStatus = null,
}) {
  return (
    <header className="h-14 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
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
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </span>
          {activeSiteName && (
            <>
              <span className="hidden sm:inline text-muted-foreground">/</span>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="truncate max-w-[200px]">{activeSiteName}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {connectionStatus && (
          <StatusBadge
            status={connectionStatus === 'connected' ? 'success' : 'neutral'}
            label={connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            className="hidden lg:inline-flex"
          />
        )}
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  )
}
