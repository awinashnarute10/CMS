import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { connectSocket, disconnectSocket, onSocketEvent, getSocket } from '@/api/socket'
import { useAuth } from '@/hooks/useAuth'
import { useSite } from '@/context/SiteContext'

const SocketContext = createContext({
  status: 'disconnected',
  isConnected: false,
  alerts: [],
  clearAlerts: () => {},
  dismissAlert: () => {},
  lastEventTimestamp: null,
  socket: null,
})

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth()
  const { selectedSiteId, setRealtimeOccupancy } = useSite()

  const [status, setStatus] = useState('disconnected')
  const [alerts, setAlerts] = useState([])
  const [lastEventTimestamp, setLastEventTimestamp] = useState(null)
  const lastToastTimeRef = useRef(0)
  const recentAlertIdsRef = useRef(new Set())

  // Keep a stable ref to selectedSiteId & setRealtimeOccupancy updated in effect
  const selectedSiteIdRef = useRef(selectedSiteId)
  const setRealtimeOccupancyRef = useRef(setRealtimeOccupancy)

  useEffect(() => {
    selectedSiteIdRef.current = selectedSiteId
    setRealtimeOccupancyRef.current = setRealtimeOccupancy
  }, [selectedSiteId, setRealtimeOccupancy])

  // Process live occupancy payloads safely
  const handleOccupancyUpdate = useCallback((payload) => {
    if (!payload || typeof payload !== 'object') return

    const siteId = payload.siteId
    const count =
      typeof payload.occupancy === 'number'
        ? payload.occupancy
        : typeof payload.count === 'number'
        ? payload.count
        : null

    if (count === null) return

    setLastEventTimestamp(Date.now())

    // Update active site occupancy if payload matches currently selected site or no siteId specified
    if (!siteId || siteId === selectedSiteIdRef.current) {
      setRealtimeOccupancyRef.current(count)
    }
  }, [])

  // Process live alert payloads safely with deduplication
  const handleAlertEvent = useCallback((payload) => {
    if (!payload || typeof payload !== 'object') return

    const alertId =
      payload.id ||
      payload.eventId ||
      `${payload.siteId || 'site'}-${payload.zoneId || 'zone'}-${payload.timestamp || Date.now()}`

    // Deduplicate rapid repeat events
    if (recentAlertIdsRef.current.has(alertId)) {
      return
    }
    recentAlertIdsRef.current.add(alertId)
    setTimeout(() => {
      recentAlertIdsRef.current.delete(alertId)
    }, 10000)

    const normalizedSeverity =
      payload.severity === 'high' || payload.severity === 'critical'
        ? 'high'
        : payload.severity === 'medium' || payload.severity === 'warning'
        ? 'medium'
        : 'low'

    const now = new Date()
    const timeFormatted = payload.timestamp
      ? new Date(payload.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    const normalizedAlert = {
      id: alertId,
      siteId: payload.siteId || selectedSiteIdRef.current || 'site-001',
      zoneId: payload.zoneId || 'zone-main',
      zoneName: payload.zoneName || payload.zoneId || 'Monitored Area',
      severity: normalizedSeverity,
      eventType: payload.eventType || payload.type || 'Security Alert',
      message: payload.message || payload.description || 'Threshold exceeded in monitored zone',
      timestamp: timeFormatted,
      rawTimestamp: payload.timestamp || Date.now(),
    }

    setLastEventTimestamp(Date.now())
    setAlerts((prev) => [normalizedAlert, ...prev.slice(0, 49)])

    // Throttled toast notification for high/medium severity events (max 1 toast per 3s)
    const timeSinceLastToast = Date.now() - lastToastTimeRef.current
    if (timeSinceLastToast > 3000) {
      lastToastTimeRef.current = Date.now()
      if (normalizedSeverity === 'high') {
        toast.error(`ALERT: ${normalizedAlert.zoneName}`, {
          description: normalizedAlert.message,
        })
      } else if (normalizedSeverity === 'medium') {
        toast.warning(`${normalizedAlert.zoneName}`, {
          description: normalizedAlert.message,
        })
      }
    }
  }, [])

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  // Socket connection lifecycle effect
  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket()
      return
    }

    const socket = connectSocket(token)

    const unConnect = onSocketEvent(socket, 'connect', () => {
      setStatus('connected')
    })

    const unDisconnect = onSocketEvent(socket, 'disconnect', (reason) => {
      setStatus(reason === 'io client disconnect' ? 'disconnected' : 'error')
    })

    const unConnectError = onSocketEvent(socket, 'connect_error', () => {
      setStatus('error')
    })

    const unReconnect = onSocketEvent(socket, 'reconnect', () => {
      setStatus('connected')
    })

    // Listen to standard occupancy event channels
    const unOcc1 = onSocketEvent(socket, 'occupancy:update', handleOccupancyUpdate)
    const unOcc2 = onSocketEvent(socket, 'occupancy', handleOccupancyUpdate)
    const unOcc3 = onSocketEvent(socket, 'live:occupancy', handleOccupancyUpdate)

    // Listen to standard alert event channels
    const unAlert1 = onSocketEvent(socket, 'alert', handleAlertEvent)
    const unAlert2 = onSocketEvent(socket, 'zone:alert', handleAlertEvent)
    const unAlert3 = onSocketEvent(socket, 'security:alert', handleAlertEvent)

    return () => {
      unConnect()
      unDisconnect()
      unConnectError()
      unReconnect()
      unOcc1()
      unOcc2()
      unOcc3()
      unAlert1()
      unAlert2()
      unAlert3()
    }
  }, [isAuthenticated, token, handleOccupancyUpdate, handleAlertEvent])

  // Isolated development mock events (only enabled when VITE_USE_MOCK_SOCKET === 'true')
  useEffect(() => {
    if (import.meta.env.VITE_USE_MOCK_SOCKET !== 'true') return

    let mockOccupancy = 142

    const interval = setInterval(() => {
      setStatus('connected')
      const delta = Math.floor(Math.random() * 5) - 2
      mockOccupancy = Math.max(10, mockOccupancy + delta)

      handleOccupancyUpdate({
        siteId: selectedSiteIdRef.current,
        occupancy: mockOccupancy,
        timestamp: Date.now(),
      })

      if (Math.random() < 0.1) {
        const severities = ['high', 'medium', 'low']
        const zones = ['zone-lobby', 'zone-server', 'zone-hall-a']
        const types = ['Density Warning', 'Access Gate Delay', 'Rapid Influx']
        const randIdx = Math.floor(Math.random() * 3)

        handleAlertEvent({
          id: `mock-alert-${Date.now()}`,
          siteId: selectedSiteIdRef.current,
          zoneId: zones[randIdx],
          zoneName: zones[randIdx].replace('zone-', 'Zone ').toUpperCase(),
          severity: severities[randIdx],
          eventType: types[randIdx],
          message: `[Dev Mock] Simulated sensor trigger in ${zones[randIdx]}`,
          timestamp: Date.now(),
        })
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [handleOccupancyUpdate, handleAlertEvent])

  const socket = isAuthenticated ? getSocket() : null

  return (
    <SocketContext.Provider
      value={{
        status,
        isConnected: status === 'connected',
        alerts,
        clearAlerts,
        dismissAlert,
        lastEventTimestamp,
        socket,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
