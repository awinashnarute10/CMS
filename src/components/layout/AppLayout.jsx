import { useState } from 'react'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'

export function AppLayout({
  activeTab = 'overview',
  onSelectTab,
  activeSiteName,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <AppSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          title={activeTab === 'overview' ? 'Overview Dashboard' : 'Crowd Entries Log'}
          activeSiteName={activeSiteName}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
