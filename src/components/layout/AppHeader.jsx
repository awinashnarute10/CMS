import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteSelector } from '@/components/common/SiteSelector'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { NotificationBell } from '@/components/common/NotificationBell'
import { UserMenu } from '@/components/common/UserMenu'

export function AppHeader({
  onOpenMobileNav,
  user = null,
}) {
  return (
    <header className="h-16 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0 shadow-subtle">
      {/* Left: Mobile Toggle, Brand Title on the left, and Location selector with pin icon */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 md:hidden text-foreground border-border bg-card hover:border-primary hover:text-primary"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <h1 className="text-base md:text-xl font-semibold tracking-tight text-foreground truncate">
          Crowd Solutions
        </h1>

        <div className="hidden sm:block h-5 w-px bg-border shrink-0" aria-hidden="true" />

        {/* Location selector with pin icon */}
        <div className="w-56 md:w-64 max-w-xs shrink-0">
          <SiteSelector />
        </div>
      </div>

      {/* Right: Theme Toggle, Notifications, User/Avatar control */}
      <div className="flex items-center gap-2.5 shrink-0">
        <ThemeToggle />
        <NotificationBell />
        <UserMenu user={user} />
      </div>
    </header>
  )
}
