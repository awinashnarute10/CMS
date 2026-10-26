import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { NotificationBell } from '@/components/common/NotificationBell'
import * as useSocketModule from '@/hooks/useSocket'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('NotificationBell Component', () => {
  let container
  let root
  let mockAlerts = []
  let mockDismissAlert = vi.fn()
  let mockClearAlerts = vi.fn()

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function () {
        this.open = true
      }
    }
    if (!HTMLDialogElement.prototype.close) {
      HTMLDialogElement.prototype.close = function () {
        this.open = false
      }
    }

    mockDismissAlert = vi.fn()
    mockClearAlerts = vi.fn()

    mockAlerts = [
      {
        id: 'alert-1',
        zoneName: 'Lobby',
        zoneId: 'zone-lobby',
        severity: 'high',
        eventType: 'Security Alert',
        message: 'High density detected',
        timestamp: '12:00:00 PM',
      },
      {
        id: 'alert-2',
        zoneName: 'Server Room',
        zoneId: 'zone-server',
        severity: 'medium',
        eventType: 'Access Warning',
        message: 'Door held open',
        timestamp: '12:01:00 PM',
      },
      {
        id: 'alert-3',
        zoneName: 'Hallway',
        zoneId: 'zone-hall',
        severity: 'low',
        eventType: 'Notice',
        message: 'Normal variance',
        timestamp: '12:02:00 PM',
      },
    ]

    vi.spyOn(useSocketModule, 'useSocket').mockImplementation(() => ({
      alerts: mockAlerts,
      dismissAlert: mockDismissAlert,
      clearAlerts: mockClearAlerts,
      status: 'connected',
    }))
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.style.overflow = ''
    vi.restoreAllMocks()
  })

  it('renders bell button with notification count badge', () => {
    act(() => {
      root.render(<NotificationBell />)
    })

    const bellBtn = container.querySelector('button[aria-label="Notifications (3)"]')
    expect(bellBtn).not.toBeNull()
    expect(bellBtn.textContent).toContain('3')
  })

  it('opens drawer using .showModal(), locks body scroll, and positions on the right side ~30% width', () => {
    const showModalSpy = vi.spyOn(HTMLDialogElement.prototype, 'showModal')

    act(() => {
      root.render(<NotificationBell />)
    })

    const bellBtn = container.querySelector('button[aria-label="Notifications (3)"]')
    act(() => {
      bellBtn.click()
    })

    expect(showModalSpy).toHaveBeenCalled()
    expect(document.body.style.overflow).toBe('hidden')

    // Verify right-side positioning and 30% responsive width class
    const drawerPanel = container.querySelector('[data-testid="notification-drawer"]')
    expect(drawerPanel).not.toBeNull()
    expect(drawerPanel.className).toContain('right-0')
    expect(drawerPanel.className).toContain('md:w-[30vw]')
    expect(drawerPanel.className).toContain('transition-transform')

    // Verify backdrop has blur effect
    const backdrop = container.querySelector('dialog > div[aria-hidden="true"]')
    expect(backdrop).not.toBeNull()
    expect(backdrop.className).toContain('backdrop-blur-sm')
  })

  it('closes drawer using .close() and restores body scroll', () => {
    const closeSpy = vi.spyOn(HTMLDialogElement.prototype, 'close')

    act(() => {
      root.render(<NotificationBell />)
    })

    const bellBtn = container.querySelector('button[aria-label="Notifications (3)"]')
    act(() => {
      bellBtn.click()
    })
    expect(document.body.style.overflow).toBe('hidden')

    const closeBtn = container.querySelector('button[aria-label="Close notifications drawer"]')
    act(() => {
      closeBtn.click()
    })

    expect(closeSpy).toHaveBeenCalled()
    expect(document.body.style.overflow).toBe('')
  })

  it('closes drawer on Escape key press and restores body scroll', () => {
    const closeSpy = vi.spyOn(HTMLDialogElement.prototype, 'close')

    act(() => {
      root.render(<NotificationBell />)
    })

    const bellBtn = container.querySelector('button[aria-label="Notifications (3)"]')
    act(() => {
      bellBtn.click()
    })
    expect(document.body.style.overflow).toBe('hidden')

    const dialog = container.querySelector('dialog')
    act(() => {
      dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })

    expect(closeSpy).toHaveBeenCalled()
    expect(document.body.style.overflow).toBe('')
  })

  it('autofocuses next alert when a non-last alert is deleted', async () => {
    act(() => {
      root.render(<NotificationBell />)
    })

    // Open drawer
    const bellBtn = container.querySelector('button[aria-label="Notifications (3)"]')
    act(() => {
      bellBtn.click()
    })

    // Find delete button of the first alert (alert-1 at index 0 of 3)
    const deleteBtns = container.querySelectorAll('button[aria-label^="Delete alert"]')
    expect(deleteBtns.length).toBe(3)

    act(() => {
      deleteBtns[0].click()
    })

    expect(mockDismissAlert).toHaveBeenCalledWith('alert-1')

    // Simulate alerts state update where alert-1 is removed
    mockAlerts = [mockAlerts[1], mockAlerts[2]]
    act(() => {
      root.render(<NotificationBell />)
    })

    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })

    // Next alert (Server Room, which was at index 1 and is now at index 0) receives focus
    const updatedAlertItems = container.querySelectorAll('[data-testid="alert-item"]')
    expect(document.activeElement).toBe(updatedAlertItems[0])
  })

  it('autofocuses heading when the deleted alert was the last alert', async () => {
    act(() => {
      root.render(<NotificationBell />)
    })

    // Open drawer
    const bellBtn = container.querySelector('button[aria-label="Notifications (3)"]')
    act(() => {
      bellBtn.click()
    })

    // Find delete button of the last alert (alert-3 at index 2 of 3)
    const deleteBtns = container.querySelectorAll('button[aria-label^="Delete alert"]')
    expect(deleteBtns.length).toBe(3)

    act(() => {
      deleteBtns[2].click()
    })

    expect(mockDismissAlert).toHaveBeenCalledWith('alert-3')

    // Simulate alerts state update where alert-3 is removed
    mockAlerts = [mockAlerts[0], mockAlerts[1]]
    act(() => {
      root.render(<NotificationBell />)
    })

    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })

    // Heading receives focus because deleted alert was the last alert
    const heading = container.querySelector('h2')
    expect(document.activeElement).toBe(heading)
  })

  it('renders "No alerts yet" placeholder when there are no notifications', () => {
    mockAlerts = []
    act(() => {
      root.render(<NotificationBell />)
    })

    const bellBtn = container.querySelector('button[aria-label="Notifications (0)"]')
    act(() => {
      bellBtn.click()
    })

    const emptyText = container.textContent
    expect(emptyText).toContain('No alerts yet')

    const drawer = container.querySelector('[data-testid="notification-drawer"]')
    expect(drawer).not.toBeNull()
    expect(drawer.className).toContain('md:w-[30vw]')
    expect(drawer.className).toContain('right-0')
  })
})
