import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CrowdEntriesPage } from '@/pages/CrowdEntriesPage'
import * as useAnalyticsModule from '@/hooks/useAnalytics'
import * as useSiteModule from '@/context/SiteContext'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('CrowdEntriesPage Component', () => {
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
        zones: [
          { zoneId: 'zone-lobby', name: 'Main Lobby' },
          { zoneId: 'zone-cafe', name: 'Cafeteria' },
        ],
      },
      selectedSiteId: 'site-001',
    })

    vi.spyOn(useAnalyticsModule, 'useEntryExitQuery').mockReturnValue({
      data: {
        totalRecords: 3,
        totalPages: 1,
        pageNumber: 1,
        pageSize: 50,
        records: [
          {
            personId: 'USR-001',
            personName: 'Alice Johnson',
            gender: 'female',
            zoneId: 'zone-lobby',
            zoneName: 'Main Lobby',
            severity: 'low',
            entryUtc: 1729814400000,
            exitUtc: null, // Still inside
            dwellMinutes: 24.5,
          },
          {
            personId: 'USR-002',
            personName: 'Bob Smith',
            gender: 'male',
            zoneId: 'zone-cafe',
            zoneName: 'Cafeteria',
            severity: 'medium',
            entryUtc: 1729810800000,
            exitUtc: 1729814400000, // Completed
            dwellMinutes: 60.0,
          },
          {
            personId: 'USR-003',
            personName: 'Charlie Davis',
            gender: 'male',
            zoneId: 'zone-lobby',
            zoneName: 'Main Lobby',
            severity: 'high',
            entryUtc: 1729818000000,
            exitUtc: null, // Still inside
            dwellMinutes: 10.0,
          },
        ],
      },
      isLoading: false,
      isFetching: false,
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

  it('renders clean PRD 5.3 visit records without 3 zones badge, search bar, or filter buttons', () => {
    act(() => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CrowdEntriesPage />
          </MemoryRouter>
        </QueryClientProvider>
      )
    })

    // Confirms no 3 zones badge
    expect(container.textContent).not.toContain('2 Zones')
    expect(container.textContent).not.toContain('3 Zones')

    // Confirms no KPI cards
    expect(container.textContent).not.toContain('Total Entries')
    expect(container.textContent).not.toContain('Page Navigation')

    // Confirms no search input or status filter buttons
    expect(container.querySelector('input[type="search"]')).toBeNull()
    expect(container.textContent).not.toContain('All (3)')
    expect(container.textContent).not.toContain('Still Inside (2)')
  })

  it('renders PRD 5.3 visit table headers and displays Active inside for un-exited visitors', () => {
    act(() => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CrowdEntriesPage />
          </MemoryRouter>
        </QueryClientProvider>
      )
    })

    // PRD 5.3 columns: Visitor Name, Gender, Entry Time, Exit Time, Dwell Time
    expect(container.textContent).toContain('Visitor Name')
    expect(container.textContent).toContain('Gender')
    expect(container.textContent).toContain('Entry Time')
    expect(container.textContent).toContain('Exit Time')
    expect(container.textContent).toContain('Dwell Time')

    // Active inside pulse for unexited visitors (Alice Johnson and Charlie Davis)
    expect(container.textContent).toContain('Active inside')
    expect(container.textContent).toContain('Alice Johnson')
    expect(container.textContent).toContain('Bob Smith')
    expect(container.textContent).toContain('Charlie Davis')
  })

  it('renders pagination controls with page size selector and record counts', () => {
    act(() => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CrowdEntriesPage />
          </MemoryRouter>
        </QueryClientProvider>
      )
    })

    // Confirms pagination controls
    expect(container.textContent).toContain('Rows:')
    expect(container.textContent).toContain('Showing')
    expect(container.textContent).toContain('records')
  })
})
