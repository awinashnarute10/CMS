import { apiClient } from './client'

export async function getSites(options = {}) {
  return apiClient.get('/sites', { signal: options.signal })
}

export async function getSiteById(siteId, options = {}) {
  return apiClient.get(`/sites/${siteId}`, { signal: options.signal })
}
