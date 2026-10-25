import { createContext, useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSites } from '@/api/sites'

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
  } = useQuery({
    queryKey: ['sites'],
    queryFn: getSites,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

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
