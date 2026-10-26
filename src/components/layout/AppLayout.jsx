import { useState } from 'react'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { useAuth } from '@/hooks/useAuth'

export function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground flex">
      {/* Sidebar - fixed 240px wide navigation rail */}
      <AppSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area - spacious with white/card header and light gray background */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
        <AppHeader
          user={user}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto min-h-0 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
