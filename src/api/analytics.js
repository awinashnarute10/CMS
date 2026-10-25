import { apiClient } from './client'
import {
  generateFixtureOccupancy,
  generateFixtureDemographics,
  generateFixtureEntryExitRecords,
} from './fixtures'

/**
 * Get average dwell duration (minutes) for a site within a period.
 * POST /api/analytics/dwell
 * @param {Object} params - { siteId, fromUtc, toUtc }
 * @param {Object} [options] - Optional axios config (e.g. AbortSignal)
 */
export async function getAverageDwell({ siteId, fromUtc, toUtc }, options = {}) {
  if (import.meta.env.VITE_USE_FIXTURES === 'true') {
    return {
      siteId,
      fromUtc,
      toUtc,
      avgDwellMinutes: 34.5,
      dwellRecords: 890,
    }
  }
  return apiClient.post(
    '/analytics/dwell',
    { siteId, fromUtc, toUtc },
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
  if (import.meta.env.VITE_USE_FIXTURES === 'true') {
    return {
      siteId,
      fromUtc,
      toUtc,
      footfall: 1420,
    }
  }
  return apiClient.post(
    '/analytics/footfall',
    { siteId, fromUtc, toUtc },
    { signal: options.signal }
  )
}

/**
 * Helper to get today's footfall (from UTC midnight to current moment).
 * POST /api/analytics/footfall
 * @param {Object} params - { siteId }
 * @param {Object} [options] - Optional axios config
 */
export async function getTodaysFootfall({ siteId }, options = {}) {
  const now = new Date()
  const startOfDayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  return getFootfall(
    {
      siteId,
      fromUtc: startOfDayUtc,
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
  if (import.meta.env.VITE_USE_FIXTURES === 'true') {
    return generateFixtureOccupancy(fromUtc, toUtc)
  }
  return apiClient.post(
    '/analytics/occupancy',
    { siteId, fromUtc, toUtc },
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
  if (import.meta.env.VITE_USE_FIXTURES === 'true') {
    return generateFixtureDemographics(fromUtc, toUtc)
  }
  return apiClient.post(
    '/analytics/demographics',
    { siteId, fromUtc, toUtc },
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
  if (import.meta.env.VITE_USE_FIXTURES === 'true') {
    return generateFixtureEntryExitRecords({ siteId, fromUtc, toUtc, pageSize, pageNumber })
  }
  return apiClient.post(
    '/analytics/entry-exit',
    {
      siteId,
      fromUtc,
      toUtc,
      pageSize,
      pageNumber,
    },
    { signal: options.signal }
  )
}

export const getEntryExit = getEntryExitRecords
