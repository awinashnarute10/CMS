import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'
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

  it('renders status filter buttons with Still Inside count and Completed count without KPI cards', () => {
    act(() => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CrowdEntriesPage />
          </MemoryRouter>
        </QueryClientProvider>
      )
    })

    // Confirms KPI cards were removed from Crowd Entries
    expect(container.textContent).not.toContain('Total Entries')
    expect(container.textContent).not.toContain('Page Navigation')

    // 2 are inside (Alice, Charlie), 1 completed (Bob)
    expect(container.textContent).toContain('All (3)')
    expect(container.textContent).toContain('Still Inside (2)')
    expect(container.textContent).toContain('Completed (1)')
  })

  it('renders "Still Inside" status badge and active visit label for visitors without exit time', () => {
    act(() => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CrowdEntriesPage />
          </MemoryRouter>
        </QueryClientProvider>
      )
    })

    expect(container.textContent).toContain('Still Inside')
    expect(container.textContent).toContain('Active inside')
    expect(container.textContent).toContain('Completed')
  })

  it('filters table to show only currently inside visitors when "Still Inside" button is clicked', () => {
    act(() => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CrowdEntriesPage />
          </MemoryRouter>
        </QueryClientProvider>
      )
    })

    const insideBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent.includes('Still Inside')
    )
    expect(insideBtn).not.toBeUndefined()

    act(() => {
      insideBtn.click()
    })

    // Alice and Charlie should be present, Bob Smith (completed) should be filtered out
    expect(container.textContent).toContain('Alice Johnson')
    expect(container.textContent).toContain('Charlie Davis')
    expect(container.textContent).not.toContain('Bob Smith')
  })
})
