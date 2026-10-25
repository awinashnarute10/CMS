import { User, Shield, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserMenu({
  user = null,
  onLogout,
}) {
  if (!user) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground"
        aria-label="Account menu"
      >
        <User className="h-4 w-4" />
      </Button>
    )
  }

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 px-2 flex items-center gap-2.5 rounded-md hover:bg-secondary border border-transparent hover:border-border transition-colors"
          aria-label="User account menu"
        >
          <div className="h-7 w-7 rounded-md bg-secondary border border-border flex items-center justify-center text-xs font-semibold text-primary">
            {initials}
          </div>
          <div className="hidden md:flex flex-col text-left leading-none">
            <span className="text-xs font-medium text-foreground">{user.name}</span>
            {user.role && (
              <span className="text-[11px] text-muted-foreground mt-0.5">{user.role}</span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            )}
            {user.role && (
              <div className="flex items-center gap-1 mt-1 text-[11px] text-primary font-medium">
                <Shield className="h-3 w-3" />
                <span>{user.role}</span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer gap-2">
          <User className="h-4 w-4" />
          <span>Profile Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer gap-2">
          <Settings className="h-4 w-4" />
          <span>Preferences</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
