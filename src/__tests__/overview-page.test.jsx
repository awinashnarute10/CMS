import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { OverviewPage } from '@/pages/OverviewPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as useAnalyticsModule from '@/hooks/useAnalytics'
import * as useSiteModule from '@/context/SiteContext'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('OverviewPage Component', () => {
  let container
  let root
  let queryClient

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    vi.spyOn(useSiteModule, 'useSite').mockReturnValue({
      selectedSite: {
        siteId: 'site-001',
        name: 'CMS Innovation Center',
        city: 'Sunnyvale',
        country: 'United States',
        timezone: 'America/Los_Angeles',
        zones: [
          { zoneId: 'zone-lobby', name: 'Main Reception & Lobby', securityLevel: 'low' },
          { zoneId: 'zone-server', name: 'Secure Datacenter Wing', securityLevel: 'high' },
        ],
      },
      selectedSiteId: 'site-001',
      isLoading: false,
    })

    vi.spyOn(useAnalyticsModule, 'useOccupancyQuery').mockReturnValue({
      data: [{ hourUtc: 1729814400000, occupancy: 45 }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    vi.spyOn(useAnalyticsModule, 'useTodaysFootfallQuery').mockReturnValue({
      data: { footfall: 1250 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    vi.spyOn(useAnalyticsModule, 'useYesterdayFootfallQuery').mockReturnValue({
      data: { footfall: 1000 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    vi.spyOn(useAnalyticsModule, 'useDwellQuery').mockReturnValue({
      data: { avgDwellMinutes: 18.5, dwellRecords: 320 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    vi.spyOn(useAnalyticsModule, 'useYesterdayDwellQuery').mockReturnValue({
      data: { avgDwellMinutes: 15.0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    vi.spyOn(useAnalyticsModule, 'useDemographicsQuery').mockReturnValue({
      data: [{ hourUtc: 1729814400000, male: 25, female: 20 }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  it('renders OverviewPage without crashing (no ReferenceError or white screen)', () => {
    act(() => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <OverviewPage />
          </MemoryRouter>
        </QueryClientProvider>
      )
    })

    expect(container.textContent).toContain('Live Occupancy')
    expect(container.textContent).toContain("Today's Footfall")
    expect(container.textContent).toContain('Avg Dwell Time')
    // Confirms dwell time formatting (18.5 min -> 18 min 30 secs)
    expect(container.textContent).toContain('18 min 30 secs')

    // Confirms footfall comparison indicator (+25% vs yesterday)
    expect(container.textContent).toContain('+25% vs yesterday')

    // Confirms Configured Zones section was removed as requested
    expect(container.textContent).not.toContain('Configured Zones')

    // Confirms '3 Zones' badge and 'Monitoring...' subtitle were removed as requested
    expect(container.textContent).not.toContain('Monitoring CMS Innovation Center')
    expect(container.textContent).not.toContain('2 Zones')
  })
})
