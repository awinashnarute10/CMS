import { apiClient } from './client'

export async function getFootfall({ siteId, fromUtc, toUtc }) {
  return apiClient.post('/analytics/footfall', { siteId, fromUtc, toUtc })
}

export async function getDwell({ siteId, fromUtc, toUtc }) {
  return apiClient.post('/analytics/dwell', { siteId, fromUtc, toUtc })
}

export async function getOccupancy({ siteId, fromUtc, toUtc }) {
  return apiClient.post('/analytics/occupancy', { siteId, fromUtc, toUtc })
}

export async function getDemographics({ siteId, fromUtc, toUtc }) {
  return apiClient.post('/analytics/demographics', { siteId, fromUtc, toUtc })
}

export async function getEntryExit({ siteId, fromUtc, toUtc, pageSize = 50, pageNumber = 1 }) {
  return apiClient.post('/analytics/entry-exit', {
    siteId,
    fromUtc,
    toUtc,
    pageSize,
    pageNumber,
  })
}
