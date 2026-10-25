import { apiClient } from './client'
import { FIXTURE_SITES } from './fixtures'

export async function getSites(options = {}) {
  if (import.meta.env.VITE_USE_FIXTURES === 'true') {
    return FIXTURE_SITES
  }
  return apiClient.get('/sites', { signal: options.signal })
}

export async function getSiteById(siteId, options = {}) {
  if (import.meta.env.VITE_USE_FIXTURES === 'true') {
    const site = FIXTURE_SITES.find((s) => s.siteId === siteId) || FIXTURE_SITES[0]
    return site
  }
  return apiClient.get(`/sites/${siteId}`, { signal: options.signal })
}
