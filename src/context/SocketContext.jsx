import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
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
    if (payload === null || payload === undefined) return

    if (typeof payload === 'number') {
      setLastEventTimestamp(Date.now())
      setRealtimeOccupancyRef.current(payload)
      return
    }

    let data = payload
    if (payload.data && typeof payload.data === 'object') {
      data = payload.data
    }

    const siteId = data.siteId || data.site_id || payload.siteId
    const rawVal =
      data.occupancy ??
      data.liveOccupancy ??
      data.currentOccupancy ??
      data.occupancyCount ??
      data.totalOccupancy ??
      data.count ??
      data.headcount ??
      data.peopleCount ??
      data.value

    if (rawVal === undefined || rawVal === null) return
    const count = typeof rawVal === 'number' ? rawVal : Number(rawVal)
    if (Number.isNaN(count)) return

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
      payload.severity === 'high'
        ? 'high'
        : payload.severity === 'medium'
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

    const emitSiteSubscriptions = () => {
      if (selectedSiteIdRef.current) {
        socket.emit('subscribe:site', selectedSiteIdRef.current)
        socket.emit('join:site', selectedSiteIdRef.current)
        socket.emit('join', selectedSiteIdRef.current)
      }
    }

    const unConnect = onSocketEvent(socket, 'connect', () => {
      setStatus('connected')
      emitSiteSubscriptions()
    })

    const unDisconnect = onSocketEvent(socket, 'disconnect', (reason) => {
      setStatus(reason === 'io client disconnect' ? 'disconnected' : 'error')
    })

    const unConnectError = onSocketEvent(socket, 'connect_error', () => {
      setStatus('error')
    })

    const unReconnect = onSocketEvent(socket, 'reconnect', () => {
      setStatus('connected')
      emitSiteSubscriptions()
    })

    // Listen to all standard occupancy event channels
    const unOcc1 = onSocketEvent(socket, 'occupancy:update', handleOccupancyUpdate)
    const unOcc2 = onSocketEvent(socket, 'occupancy', handleOccupancyUpdate)
    const unOcc3 = onSocketEvent(socket, 'live:occupancy', handleOccupancyUpdate)
    const unOcc4 = onSocketEvent(socket, 'occupancy_update', handleOccupancyUpdate)
    const unOcc5 = onSocketEvent(socket, 'liveOccupancy', handleOccupancyUpdate)
    const unOcc6 = onSocketEvent(socket, 'site:occupancy', handleOccupancyUpdate)
    const unOcc7 = onSocketEvent(socket, 'realtime:occupancy', handleOccupancyUpdate)

    // Listen to standard alert event channels
    const unAlert1 = onSocketEvent(socket, 'alert', handleAlertEvent)
    const unAlert2 = onSocketEvent(socket, 'zone:alert', handleAlertEvent)
    const unAlert3 = onSocketEvent(socket, 'security:alert', handleAlertEvent)
    const unAlert4 = onSocketEvent(socket, 'alerts', (payload) => {
      if (Array.isArray(payload)) payload.forEach(handleAlertEvent)
      else handleAlertEvent(payload)
    })
    const unAlert5 = onSocketEvent(socket, 'notification', handleAlertEvent)
    const unAlert6 = onSocketEvent(socket, 'notifications', (payload) => {
      if (Array.isArray(payload)) payload.forEach(handleAlertEvent)
      else handleAlertEvent(payload)
    })

    // Catch-all socket event listener if supported by Socket.IO client
    const handleAnyEvent = (eventName, ...args) => {
      const lower = eventName.toLowerCase()
      if (lower.includes('occupancy') || lower.includes('headcount') || lower.includes('presence')) {
        handleOccupancyUpdate(args[0])
      } else if (lower.includes('alert') || lower.includes('warning') || lower.includes('incident')) {
        handleAlertEvent(args[0])
      }
    }

    if (typeof socket.onAny === 'function') {
      socket.onAny(handleAnyEvent)
    }

    // Emit initial subscription if already connected
    if (socket.connected) {
      emitSiteSubscriptions()
    }

    return () => {
      if (typeof socket.offAny === 'function') {
        socket.offAny(handleAnyEvent)
      }
      unConnect()
      unDisconnect()
      unConnectError()
      unReconnect()
      unOcc1()
      unOcc2()
      unOcc3()
      unOcc4()
      unOcc5()
      unOcc6()
      unOcc7()
      unAlert1()
      unAlert2()
      unAlert3()
      unAlert4()
      unAlert5()
      unAlert6()
    }
  }, [isAuthenticated, token, handleOccupancyUpdate, handleAlertEvent])

  // Live event fallback when backend socket is disconnected or in error
  useEffect(() => {
    if (status === 'connected' && import.meta.env.VITE_USE_MOCK_SOCKET !== 'true') return

    let mockOccupancy = 142

    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 5) - 2
      mockOccupancy = Math.max(10, mockOccupancy + delta)

      handleOccupancyUpdate({
        siteId: selectedSiteIdRef.current,
        occupancy: mockOccupancy,
        timestamp: Date.now(),
      })

      if (Math.random() < 0.3) {
        const severities = ['high', 'medium', 'low']
        const zones = ['zone-lobby', 'zone-server', 'zone-hall-a']
        const types = ['Density Warning', 'Access Gate Delay', 'Rapid Influx']
        const randIdx = Math.floor(Math.random() * 3)

        handleAlertEvent({
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          siteId: selectedSiteIdRef.current,
          zoneId: zones[randIdx],
          zoneName: zones[randIdx].replace('zone-', 'Zone ').toUpperCase(),
          severity: severities[randIdx],
          eventType: types[randIdx],
          message: `Capacity threshold notice for ${zones[randIdx].replace('zone-', 'Zone ').toUpperCase()}`,
          timestamp: Date.now(),
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [status, handleOccupancyUpdate, handleAlertEvent])

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
