import { describe, it, expect, vi } from 'vitest'
import { getSocketUrl, onSocketEvent } from '@/api/socket'

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
