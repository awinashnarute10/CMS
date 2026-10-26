import { useState, useRef, useEffect } from 'react'
import { Bell, X, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useSocket } from '@/hooks/useSocket'
import { cn } from '@/lib/utils'

export function NotificationBell({ className }) {
  const { alerts, dismissAlert, clearAlerts } = useSocket()
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const dialogRef = useRef(null)
  const headingRef = useRef(null)
  const bellButtonRef = useRef(null)
  const alertItemRefs = useRef([])
  const pendingFocusRef = useRef(null)
  const closeTimeoutRef = useRef(null)

  // Keep alertItemRefs array length synchronized with alerts
  alertItemRefs.current = alertItemRefs.current.slice(0, alerts.length)

  const handleOpenModal = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal()
      document.body.style.overflow = 'hidden'
      setIsOpen(true)

      // Animate sliding in and backdrop fading in
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    }
  }

  const handleCloseModal = () => {
    setIsVisible(false)

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }

    // In test environment run close immediately; in browser, wait 300ms for slide-out animation
    const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'
    const duration = isTest ? 0 : 300

    if (duration === 0) {
      if (dialogRef.current?.open) {
        dialogRef.current.close()
      }
      document.body.style.overflow = ''
      setIsOpen(false)
      bellButtonRef.current?.focus()
    } else {
      closeTimeoutRef.current = setTimeout(() => {
        if (dialogRef.current?.open) {
          dialogRef.current.close()
        }
        document.body.style.overflow = ''
        setIsOpen(false)
        bellButtonRef.current?.focus()
      }, duration)
    }
  }

  // Handle alert deletion with autofocus requirement:
  // "autofocus when an alert is deleted should go to next alert or heading if the deleted was last alert"
  const handleDeleteAlert = (index, alertId) => {
    const isLast = index === alerts.length - 1
    pendingFocusRef.current = {
      type: isLast ? 'heading' : 'next',
      index,
    }
    dismissAlert(alertId)
  }

  // Execute autofocus after DOM updates with the updated alerts array
  useEffect(() => {
    if (!pendingFocusRef.current) return

    const { type, index } = pendingFocusRef.current
    pendingFocusRef.current = null

    requestAnimationFrame(() => {
      if (type === 'heading') {
        headingRef.current?.focus()
      } else {
        const nextAlertEl = alertItemRefs.current[index]
        if (nextAlertEl) {
          nextAlertEl.focus()
        } else {
          headingRef.current?.focus()
        }
      }
    })
  }, [alerts])

  // Restore body overflow and clear any timeout when component unmounts
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
      document.body.style.overflow = ''
    }
  }, [])

  // Keep focus trapped within drawer on Tab key press, and handle Esc key with animated slide-out
  const handleDialogKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      handleCloseModal()
      return
    }

    if (e.key === 'Tab') {
      const focusable = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }

  const unreadCount = alerts.length

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      {/* Bell Button beside User Profile */}
      <Button
        ref={bellButtonRef}
        variant="outline"
        size="icon"
        onClick={handleOpenModal}
        aria-label={`Notifications (${unreadCount})`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="h-8 w-8 relative rounded-lg border-border text-foreground bg-card hover:border-primary hover:text-primary transition-colors focus-visible:ring-1 focus-visible:ring-primary"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--status-danger)] text-white text-[10px] font-bold px-1 leading-none shadow-sm pointer-events-none"
            aria-hidden="true"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Native Modal Dialog as Right Drawer Container */}
      <dialog
        ref={dialogRef}
        onKeyDown={handleDialogKeyDown}
        onCancel={(e) => {
          e.preventDefault()
          handleCloseModal()
        }}
        onClose={() => {
          document.body.style.overflow = ''
          setIsOpen(false)
          setIsVisible(false)
        }}
        className="fixed inset-0 m-0 p-0 w-screen h-screen max-w-none max-h-none bg-transparent border-0 overflow-hidden z-50 backdrop:bg-transparent focus:outline-none"
      >
        {/* Backdrop Overlay with Blur and Fade In/Out Animation */}
        <div
          onClick={handleCloseModal}
          aria-hidden="true"
          className={cn(
            'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out',
            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        />

        {/* Drawer Panel: Sits on Right, ~30% Width, Smooth Slide In/Out Animation */}
        <div
          data-testid="notification-drawer"
          className={cn(
            'fixed top-0 right-0 bottom-0 h-full',
            'w-[85vw] sm:w-[380px] md:w-[30vw] min-w-[300px] max-w-[500px]',
            'bg-card text-foreground border-l border-border shadow-2xl flex flex-col z-10',
            'transform transition-transform duration-300 ease-in-out',
            isVisible ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/60 rounded px-1.5 py-0.5"
            >
              <Bell className="h-4 w-4 text-primary" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[11px] font-mono font-medium bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">
                  {unreadCount}
                </span>
              )}
            </h2>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearAlerts()
                    headingRef.current?.focus()
                  }}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground rounded-md"
                >
                  Clear all
                </Button>
              )}
              <button
                type="button"
                onClick={handleCloseModal}
                className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
                aria-label="Close notifications drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Drawer Content - Scrollable Alerts List or Empty Placeholder */}
          <div
            className={cn(
              'overflow-y-auto p-3 flex-1 min-h-0',
              unreadCount === 0 ? 'flex flex-col items-center justify-center' : 'space-y-2.5'
            )}
          >
            {unreadCount === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-2.5 px-4">
                <div className="h-10 w-10 rounded-full bg-[var(--status-success-bg)] border border-[var(--status-success-border)] flex items-center justify-center text-[var(--status-success)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">No alerts yet</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5 leading-relaxed">
                    All monitored areas and capacity thresholds are currently operating within normal limits.
                  </p>
                </div>
              </div>
            ) : (
              alerts.map((alert, index) => {
                const isHigh = alert.severity === 'high'
                const isMedium = alert.severity === 'medium'

                return (
                  <div
                    key={alert.id}
                    ref={(el) => (alertItemRefs.current[index] = el)}
                    tabIndex={-1}
                    data-testid="alert-item"
                    data-alert-id={alert.id}
                    onKeyDown={(e) => {
                      if (e.key === 'Delete' || e.key === 'Backspace') {
                        e.preventDefault()
                        handleDeleteAlert(index, alert.id)
                      }
                    }}
                    className={cn(
                      'p-3 rounded-lg border flex items-start justify-between gap-3 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                      isHigh
                        ? 'border-[var(--status-danger-border)] bg-[var(--status-danger-bg)]/40'
                        : isMedium
                        ? 'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)]/40'
                        : 'border-[var(--status-success-border)] bg-[var(--status-success-bg)]/30'
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <ShieldAlert
                        className={cn(
                          'h-4 w-4 shrink-0 mt-0.5',
                          isHigh
                            ? 'text-[var(--status-danger)]'
                            : isMedium
                            ? 'text-[var(--status-warning)]'
                            : 'text-[var(--status-success)]'
                        )}
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-foreground truncate">
                            {alert.zoneName || alert.zoneId}
                          </span>
                          {alert.eventType && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-secondary text-muted-foreground font-mono uppercase">
                              {alert.eventType}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-tight">
                          {alert.message}
                        </p>
                        {alert.zoneId && (
                          <span className="text-[10px] text-muted-foreground/75 font-mono block">
                            Zone: {alert.zoneId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge
                          status={isHigh ? 'high' : isMedium ? 'medium' : 'low'}
                          label={isHigh ? 'HIGH' : isMedium ? 'MEDIUM' : 'LOW'}
                          showDot={false}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteAlert(index, alert.id)}
                          className="h-6 w-6 rounded hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
                          aria-label={`Delete alert for ${alert.zoneName || alert.zoneId}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {alert.timestamp && (
                        <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                          {alert.timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </dialog>
    </div>
  )
}
