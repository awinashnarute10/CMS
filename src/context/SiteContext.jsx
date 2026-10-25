import { createContext, useContext, useState } from 'react'
import { useSitesQuery } from '@/hooks/useSites'
import { useAuth } from '@/hooks/useAuth'

const SITE_STORAGE_KEY = 'cms_selected_site_id'

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
  const [explicitSiteId, setExplicitSiteId] = useState(() => {
    try {
      return localStorage.getItem(SITE_STORAGE_KEY) || null
    } catch {
      return null
    }
  })

  const {
    data: sites = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSitesQuery({ enabled: isAuthenticated })

  // Derive activeSiteId without synchronous setState in effect
  const selectedSiteId =
    explicitSiteId && sites.some((s) => s.siteId === explicitSiteId)
      ? explicitSiteId
      : sites[0]?.siteId || null

  const handleSelectSite = (siteId) => {
    setExplicitSiteId(siteId)
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
