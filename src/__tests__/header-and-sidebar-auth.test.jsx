import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserMenu } from '@/components/common/UserMenu'
import { AppSidebar } from '@/components/layout/AppSidebar'
import * as AuthContextModule from '@/context/AuthContext'
import * as SiteContextModule from '@/context/SiteContext'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('Header Profile Avatar and Sidebar Logout', () => {
  let container
  let root
  let queryClient
  let mockLogout

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    mockLogout = vi.fn()
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { email: 'operator@kloudspot.com', name: 'Test Operator', role: 'admin' },
      isAuthenticated: true,
      logout: mockLogout,
    })

    vi.spyOn(SiteContextModule, 'useSite').mockReturnValue({
      selectedSiteId: 'site-001',
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  it('renders user profile in header as a circular button showing the email initial', () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <UserMenu user={{ email: 'test@kloudspot.com', name: 'Test Account' }} />
        </MemoryRouter>
      )
    })

    // Button must be circular (rounded-full)
    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button.className).toContain('rounded-full')

    // Must show email initial 'T' (from test@kloudspot.com), not the text 'Test Account'
    expect(button.textContent.trim()).toBe('T')
    expect(button.textContent).not.toContain('Test Account')
  })

  it('renders sidebar logout button at the bottom with icon and Logout title side by side', () => {
    act(() => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AppSidebar />
          </MemoryRouter>
        </QueryClientProvider>
      )
    })

    // Finds the logout button
    const logoutBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Logout')
    )
    expect(logoutBtn).toBeDefined()
    expect(logoutBtn.getAttribute('aria-label')).toBe('Logout')

    // Expect Logout title and SVG icon to be present side by side
    const svgIcon = logoutBtn.querySelector('svg')
    expect(svgIcon).not.toBeNull()
    expect(logoutBtn.textContent).toContain('Logout')

    // Clicking it triggers logout
    act(() => {
      logoutBtn.click()
    })
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
