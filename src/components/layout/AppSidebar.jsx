import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, X, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  {
    id: 'overview',
    path: '/overview',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    id: 'crowd-entries',
    path: '/crowd-entries',
    label: 'Crowd Entries',
    icon: Users,
  },
]

export function AppSidebar({
  mobileOpen = false,
  onCloseMobile,
  className,
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('cms_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    onCloseMobile?.()
    navigate('/login')
  }

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('cms_sidebar_collapsed', String(next))
      } catch {
        // ignore storage error
      }
      return next
    })
  }

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

      {/* Sidebar Container: Collapsible navigation rail with dark gradient & abstract network pattern */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 sidebar-gradient border-r border-[#17282B] flex flex-col h-full transition-all duration-200 ease-in-out md:static md:translate-x-0 md:h-screen md:shrink-0 relative overflow-hidden',
          isCollapsed
            ? 'w-[76px] min-w-[76px] max-w-[76px]'
            : 'w-[240px] min-w-[240px] max-w-[240px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        aria-label="Main Navigation"
      >
        {/* Abstract geometric network background overlay */}
        <div
          className="absolute inset-0 sidebar-network-pattern pointer-events-none opacity-80"
          aria-hidden="true"
        />

        {/* Brand / Header: White brand logo + chevron toggle control */}
        <div
          className={cn(
            'h-16 border-b border-white/10 flex items-center shrink-0 relative z-10 transition-all',
            isCollapsed ? 'px-2 justify-between gap-1.5' : 'px-4 justify-between'
          )}
        >
          {isCollapsed ? (
            <>
              <div
                className="h-8 w-8 rounded-lg bg-[#0B8F8B] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0"
                title="CMS - Crowd Ops"
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 001.5-7.7 5.5 5.5 0 00-10.7-1.8A4 4 0 003 15z" />
                  <circle cx="12" cy="13" r="1.5" fill="currentColor" />
                </svg>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#A0B0B2] hover:text-white hover:bg-white/10 rounded-md shrink-0"
                onClick={toggleCollapse}
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-[#0B8F8B] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 001.5-7.7 5.5 5.5 0 00-10.7-1.8A4 4 0 003 15z" />
                    <circle cx="12" cy="13" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight text-white leading-none">
                    CMS
                  </span>
                  <span className="text-[10px] text-[#A0B0B2] uppercase tracking-widest font-mono mt-1">
                    Crowd Ops
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#A0B0B2] hover:text-white hover:bg-white/10 rounded-md shrink-0"
                onClick={() => (mobileOpen ? onCloseMobile?.() : toggleCollapse())}
                aria-label={mobileOpen ? 'Close navigation menu' : 'Collapse sidebar'}
                title={mobileOpen ? 'Close navigation menu' : 'Collapse sidebar'}
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>

        {/* Navigation Items: Vertically stacked, icons centered when collapsed, label shown when expanded */}
        <nav className={cn('flex-1 py-4 space-y-1.5 relative z-10', isCollapsed ? 'px-2' : 'px-3')}>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#A0B0B2]">
              Navigation
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === item.path ||
              (item.id === 'overview' && location.pathname === '/')
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  navigate(item.path)
                  onCloseMobile?.()
                }}
                title={item.label}
                aria-label={item.label}
                className={cn(
                  'group flex items-center rounded-lg text-sm transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B8F8B]',
                  isCollapsed
                    ? 'justify-center h-10 w-10 mx-auto px-0'
                    : 'w-full gap-3 px-3.5 py-2.5 text-left',
                  isActive
                    ? 'bg-[#718486]/50 text-white font-medium shadow-xs'
                    : 'text-[#A0B0B2] hover:text-white hover:bg-white/10 font-normal'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Slim white indicator bar on the left */}
                {isActive && (
                  <span
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 bg-white rounded-r',
                      isCollapsed ? 'left-0 w-0.5 h-4' : 'left-0 w-1 h-5'
                    )}
                    aria-hidden="true"
                  />
                )}
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-[#A0B0B2] group-hover:text-white'
                  )}
                />
                {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Bottom Section: Logout action with icon and title side by side */}
        <div className={cn('p-3 border-t border-[#718486]/30 relative z-10', isCollapsed && 'px-2 flex justify-center')}>
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className={cn(
              'group flex items-center rounded-lg text-sm text-[#A0B0B2] hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B8F8B]',
              isCollapsed
                ? 'justify-center h-10 w-10 mx-auto px-0'
                : 'w-full gap-3 px-3.5 py-2.5 text-left'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0 transition-colors text-[#A0B0B2] group-hover:text-white" />
            {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
