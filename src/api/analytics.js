import { apiClient } from './client'

/**
 * Ensures toUtc is always the exact current time when the API is fired,
 * while preserving explicit historical comparison ranges (e.g. yesterday's footfall window).
 */
export function resolveLiveTimeRange(fromUtc, toUtc) {
  const now = Date.now()

  // If toUtc is explicitly an immutable historical past window (e.g. yesterday, > 2h in the past)
  if (typeof toUtc === 'number' && toUtc < now - 1000 * 60 * 60 * 2) {
    return { fromUtc, toUtc }
  }

  const duration =
    typeof toUtc === 'number' && typeof fromUtc === 'number' && toUtc > fromUtc
      ? toUtc - fromUtc
      : 1000 * 60 * 60 * 24 // default 24h

  return {
    toUtc: now,
    fromUtc: now - duration,
  }
}

/**
 * Get average dwell duration (minutes) for a site within a period.
 * POST /api/analytics/dwell
 * @param {Object} params - { siteId, fromUtc, toUtc }
 * @param {Object} [options] - Optional axios config (e.g. AbortSignal)
 */
export async function getAverageDwell({ siteId, fromUtc, toUtc }, options = {}) {
  const range = resolveLiveTimeRange(fromUtc, toUtc)
  return apiClient.post(
    '/analytics/dwell',
    { siteId, fromUtc: range.fromUtc, toUtc: range.toUtc },
    { signal: options.signal }
  )
}

export const getAverageDwellTime = getAverageDwell
export const getDwell = getAverageDwell

/**
 * Count total number of entries during a period (NOT unique visitors).
 * POST /api/analytics/footfall
 * @param {Object} params - { siteId, fromUtc, toUtc }
 * @param {Object} [options] - Optional axios config
 */
export async function getFootfall({ siteId, fromUtc, toUtc }, options = {}) {
  const range = resolveLiveTimeRange(fromUtc, toUtc)
  return apiClient.post(
    '/analytics/footfall',
    { siteId, fromUtc: range.fromUtc, toUtc: range.toUtc },
    { signal: options.signal }
  )
}

/**
 * Helper to get rolling 24h footfall (from current hour minus 24h to current moment).
 * POST /api/analytics/footfall
 * @param {Object} params - { siteId }
 * @param {Object} [options] - Optional axios config
 */
export async function getTodaysFootfall({ siteId }, options = {}) {
  const now = new Date()
  const currentHourMs = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    0,
    0,
    0
  ).getTime()
  return getFootfall(
    {
      siteId,
      fromUtc: currentHourMs - 24 * 60 * 60 * 1000,
      toUtc: now.getTime(),
    },
    options
  )
}

/**
 * Get hourly occupancy analytics for a site.
 * POST /api/analytics/occupancy
 * @param {Object} params - { siteId, fromUtc, toUtc }
 * @param {Object} [options] - Optional axios config
 */
export async function getOccupancyTimeSeries({ siteId, fromUtc, toUtc }, options = {}) {
  const range = resolveLiveTimeRange(fromUtc, toUtc)
  return apiClient.post(
    '/analytics/occupancy',
    { siteId, fromUtc: range.fromUtc, toUtc: range.toUtc },
    { signal: options.signal }
  )
}

export const getOccupancy = getOccupancyTimeSeries

/**
 * Get hourly gender demographics analytics for a site.
 * POST /api/analytics/demographics
 * @param {Object} params - { siteId, fromUtc, toUtc }
 * @param {Object} [options] - Optional axios config
 */
export async function getDemographics({ siteId, fromUtc, toUtc }, options = {}) {
  const range = resolveLiveTimeRange(fromUtc, toUtc)
  return apiClient.post(
    '/analytics/demographics',
    { siteId, fromUtc: range.fromUtc, toUtc: range.toUtc },
    { signal: options.signal }
  )
}

/**
 * Get combined entry–exit session history for a site (paginated).
 * POST /api/analytics/entry-exit
 * @param {Object} params - { siteId, fromUtc, toUtc, pageSize, pageNumber }
 * @param {Object} [options] - Optional axios config
 */
export async function getEntryExitRecords(
  { siteId, fromUtc, toUtc, pageSize = 50, pageNumber = 1 },
  options = {}
) {
  const range = resolveLiveTimeRange(fromUtc, toUtc)
  return apiClient.post(
    '/analytics/entry-exit',
    {
      siteId,
      fromUtc: range.fromUtc,
      toUtc: range.toUtc,
      pageSize,
      pageNumber,
    },
    { signal: options.signal }
  )
}

export const getEntryExit = getEntryExitRecords

