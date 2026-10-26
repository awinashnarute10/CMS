import { useNavigate } from 'react-router-dom'
import { Shield, LogOut, LogIn } from 'lucide-react'
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
        className="h-8 text-xs font-medium gap-1.5 border-border bg-card text-foreground hover:border-primary hover:text-primary rounded-lg shadow-xs"
        aria-label="Sign in"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Sign In</span>
      </Button>
    )
  }

  const emailInitial = currentUser.email
    ? currentUser.email.trim()[0].toUpperCase()
    : currentUser.name
    ? currentUser.name.trim()[0].toUpperCase()
    : 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full bg-secondary border border-border hover:border-primary text-primary font-semibold text-xs transition-colors shadow-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary flex items-center justify-center p-0"
          aria-label={`User account: ${currentUser.email || currentUser.name || 'User'}`}
          title={currentUser.email || currentUser.name}
        >
          {emailInitial}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border shadow-md rounded-lg">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{currentUser.name}</p>
            {currentUser.email && (
              <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
            )}
            {currentUser.role && (
              <div className="flex items-center gap-1 mt-1 text-[11px] text-primary font-medium">
                <Shield className="h-3 w-3" />
                <span className="capitalize">{currentUser.role}</span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 text-xs rounded-md"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
