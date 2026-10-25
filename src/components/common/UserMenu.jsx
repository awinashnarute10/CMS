import { useNavigate } from 'react-router-dom'
import { User, Shield, LogOut, Settings, LogIn } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
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
  const auth = useAuth()
  const navigate = useNavigate()

  const currentUser = user || auth.user

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      auth.logout()
      navigate('/login')
    }
  }

  if (!currentUser) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/login')}
        className="h-8 text-xs font-medium gap-1.5 border-border"
        aria-label="Sign in"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Sign In</span>
      </Button>
    )
  }

  const initials = currentUser.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
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
            <span className="text-xs font-medium text-foreground">{currentUser.name}</span>
            {currentUser.role && (
              <span className="text-[11px] text-muted-foreground mt-0.5">{currentUser.role}</span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{currentUser.name}</p>
            {currentUser.email && (
              <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
            )}
            {currentUser.role && (
              <div className="flex items-center gap-1 mt-1 text-[11px] text-primary font-medium">
                <Shield className="h-3 w-3" />
                <span>{currentUser.role}</span>
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
          onClick={handleLogout}
          className="cursor-pointer gap-2 text-[var(--status-danger)] focus:text-[var(--status-danger)] focus:bg-[var(--status-danger-bg)]"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
