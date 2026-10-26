import { describe, it, expect, vi } from 'vitest'
import { getSocketUrl, onSocketEvent } from '@/api/socket'
import { getAlertDedupeKey, updateOccupancyTotal } from '@/lib/socketUtils'

describe('Socket.IO URL & Origin Configuration', () => {
  it('correctly resolves socket origin from HTTP base URL', () => {
    const url = getSocketUrl()
    expect(url).toMatch(/^https?:\/\//)
    expect(url).not.toContain('/api')
  })
})

describe('Socket Event Subscription & Cleanup', () => {
  it('registers and cleanly removes event listeners using returned cleanup handler', () => {
    const mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
    }

    const handler = vi.fn()
    const unsubscribe = onSocketEvent(mockSocket, 'occupancy:update', handler)

    expect(mockSocket.on).toHaveBeenCalledWith('occupancy:update', handler)

    unsubscribe()
    expect(mockSocket.off).toHaveBeenCalledWith('occupancy:update', handler)
  })

  it('safely handles null socket without throwing', () => {
    expect(() => {
      const unsub = onSocketEvent(null, 'test:event', () => {})
      unsub()
    }).not.toThrow()
  })
})

describe('Socket payload state', () => {
  it('clears stale zone counts when a global occupancy update arrives', () => {
    const zones = new Map([['lobby', 10], ['entrance', 20]])

    expect(updateOccupancyTotal(zones, null, 20)).toBe(20)
    expect(updateOccupancyTotal(zones, 'lobby', 8)).toBe(8)
  })

  it('uses a stable key for repeated alerts without server identifiers', () => {
    const alert = {
      siteId: 'site-001',
      zoneId: 'lobby',
      eventType: 'capacity',
      message: 'Capacity threshold reached',
    }

    expect(getAlertDedupeKey(alert)).toBe(getAlertDedupeKey({ ...alert }))
  })
})
