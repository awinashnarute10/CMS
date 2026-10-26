import { createContext, useContext, useState } from 'react'
import { useSitesQuery } from '@/hooks/useSites'
import { useAuth } from '@/hooks/useAuth'

const SITE_STORAGE_KEY = 'cms_selected_site_id'
const DEFAULT_SITE_ID = 'SITE-AE-DXB-001'

const SiteContext = createContext({
  selectedSite: null,
  selectedSiteId: null,
  setSelectedSiteId: () => null,
  sites: [],
  isLoading: false,
  isError: false,
})

export function SiteProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [realtimeOccupancy, setRealtimeOccupancy] = useState(null)
  const [explicitSiteId, setExplicitSiteId] = useState(() => {
    try {
      const stored = localStorage.getItem(SITE_STORAGE_KEY)
      // Discard legacy fixture ID if stored
      if (stored === 'site-001') {
        localStorage.removeItem(SITE_STORAGE_KEY)
        return DEFAULT_SITE_ID
      }
      return stored || DEFAULT_SITE_ID
    } catch {
      return DEFAULT_SITE_ID
    }
  })

  const {
    data: sites = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSitesQuery({ enabled: isAuthenticated })

  // Derive activeSiteId without synchronous setState in effect:
  // If the user has a stored site ID or default site ID, trust it immediately so child queries (occupancy, footfall, dwell, demographics)
  // fire in parallel with GET /sites instead of waiting for GET /sites to complete (eliminating request waterfall).
  // Only if sites has loaded and explicitSiteId is not in the list, fall back to sites[0].siteId.
  const selectedSiteId =
    explicitSiteId && (!sites.length || sites.some((s) => s.siteId === explicitSiteId))
      ? explicitSiteId
      : sites[0]?.siteId || explicitSiteId || DEFAULT_SITE_ID

  const handleSelectSite = (siteId) => {
    setExplicitSiteId(siteId)
    setRealtimeOccupancy(null)
    try {
      localStorage.setItem(SITE_STORAGE_KEY, siteId)
    } catch {
      // ignore storage error
    }
  }

  const selectedSite = sites.find((s) => s.siteId === selectedSiteId) || null

  return (
    <SiteContext.Provider
      value={{
        selectedSite,
        selectedSiteId,
        setSelectedSiteId: handleSelectSite,
        sites,
        isLoading,
        isError,
        error,
        refetch,
        realtimeOccupancy,
        setRealtimeOccupancy,
      }}
    >
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  const context = useContext(SiteContext)
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider')
  }
  return context
}
