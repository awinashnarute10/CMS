import { apiClient } from './client'

export async function getSites() {
  return apiClient.get('/sites')
}

export async function getSiteById(siteId) {
  return apiClient.get(`/sites/${siteId}`)
}
