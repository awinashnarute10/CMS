import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { useSocket } from '@/hooks/useSocket'
import { useAuth } from '@/hooks/useAuth'

export function AppLayout({
  activeSiteName = null,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { status: connectionStatus } = useSocket()
  const { user } = useAuth()

  const getPageTitle = () => {
    if (location.pathname.startsWith('/crowd-entries')) {
      return 'Crowd Entries Log'
    }
    return 'Overview Dashboard'
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <AppSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          title={getPageTitle()}
          activeSiteName={activeSiteName}
          user={user}
          connectionStatus={connectionStatus}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
