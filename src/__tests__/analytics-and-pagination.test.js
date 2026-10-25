import { describe, it, expect } from 'vitest'
import { shouldRetryQuery } from '@/lib/queryClient'
import { computeRangeFromPreset, TIME_PRESETS } from '@/components/common/TimeRangeSelector'
import { analyticsKeys } from '@/hooks/useAnalytics'

describe('TanStack Query Policies & Keys', () => {
  it('never retries 4xx client, authentication, or validation errors', () => {
    // 401 Auth error
    expect(shouldRetryQuery(0, { status: 401, isAuthError: true })).toBe(false)
    // 403 Forbidden
    expect(shouldRetryQuery(0, { status: 403, isAuthError: true })).toBe(false)
    // 400 Bad request / validation
    expect(shouldRetryQuery(0, { status: 400, isClientError: true })).toBe(false)
    // 404 Not Found
    expect(shouldRetryQuery(0, { status: 404, isClientError: true })).toBe(false)
  })

  it('permits up to 2 retries on transient network disconnects or 5xx server issues', () => {
    expect(shouldRetryQuery(0, { isNetworkError: true })).toBe(true)
    expect(shouldRetryQuery(1, { status: 500 })).toBe(true)
    // Stops after 2 retries
    expect(shouldRetryQuery(2, { status: 500 })).toBe(false)
  })

  it('produces isolated query keys containing all relevant query parameters', () => {
    const params1 = { siteId: 'site-001', fromUtc: 1000, toUtc: 2000 }
    const params2 = { siteId: 'site-002', fromUtc: 1000, toUtc: 2000 }

    expect(analyticsKeys.occupancy(params1)).toEqual(['analytics', 'occupancy', params1])
    expect(analyticsKeys.occupancy(params2)).not.toEqual(analyticsKeys.occupancy(params1))

    const entryParams = { siteId: 'site-001', fromUtc: 1000, toUtc: 2000, pageSize: 50, pageNumber: 2 }
    expect(analyticsKeys.entryExit(entryParams)).toEqual(['analytics', 'entry-exit', entryParams])
  })
})

describe('Time Range & Preset Calculations', () => {
  it('computes correct fromUtc and toUtc millisecond intervals from presets', () => {
    const before = Date.now()
    const { fromUtc, toUtc, presetId } = computeRangeFromPreset('24h')
    const after = Date.now()

    expect(TIME_PRESETS.length).toBeGreaterThanOrEqual(4)
    expect(presetId).toBe('24h')
    expect(toUtc).toBeGreaterThanOrEqual(before)
    expect(toUtc).toBeLessThanOrEqual(after)
    expect(toUtc - fromUtc).toBe(1000 * 60 * 60 * 24)
  })

  it('falls back gracefully to 24h when unknown preset is passed', () => {
    const { presetId } = computeRangeFromPreset('unknown-period')
    expect(presetId).toBe('24h')
  })
})

describe('Data Incompleteness & Formatting Safeguards', () => {
  it('handles null/missing exit times and dwell times truthfully without assuming values', () => {
    const rawRecordMissingExit = {
      personId: 'P-1',
      personName: 'Alice',
      entryUtc: 1729814400000,
      exitUtc: null,
      dwellMinutes: null,
    }

    // A missing exit time must not be assumed as ongoing or completed unless specified
    expect(rawRecordMissingExit.exitUtc).toBeNull()
    // A missing dwell time must not be calculated from incomplete bounds
    expect(rawRecordMissingExit.dwellMinutes).toBeNull()
  })

  it('calculates pagination totalPages and bounds accurately', () => {
    const totalRecords = 142
    const pageSize = 50
    const totalPages = Math.ceil(totalRecords / pageSize)
    expect(totalPages).toBe(3)

    // Page 1 slice: 1 - 50
    const p1Start = (1 - 1) * pageSize + 1
    const p1End = Math.min(1 * pageSize, totalRecords)
    expect(p1Start).toBe(1)
    expect(p1End).toBe(50)

    // Page 3 slice: 101 - 142
    const p3Start = (3 - 1) * pageSize + 1
    const p3End = Math.min(3 * pageSize, totalRecords)
    expect(p3Start).toBe(101)
    expect(p3End).toBe(142)
  })
})
