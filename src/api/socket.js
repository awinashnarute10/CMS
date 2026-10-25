import { io } from 'socket.io-client'

let socketInstance = null

export function getSocketUrl() {
  const customSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim()
  if (customSocketUrl) {
    return customSocketUrl.replace(/["']/g, '').replace(/\/+$/, '')
  }

  const rawBaseUrl = import.meta.env.VITE_BASE_URL?.trim() || 'https://hiring-dev.internal.kloudspot.com/api'
  const clean = rawBaseUrl.replace(/["']/g, '').trim()
  try {
    const url = new URL(clean)
    return url.origin
  } catch {
    return 'https://hiring-dev.internal.kloudspot.com'
  }
}

/**
 * Initialize or retrieve the singleton Socket.IO instance
 * @param {string|null} token - Optional authentication token
 */
export function getSocket(token = null) {
  if (socketInstance) {
    if (token) {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim()
      socketInstance.auth = { token: cleanToken }
    }
    return socketInstance
  }

  const url = getSocketUrl()
  const cleanToken = token
    ? (token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim())
    : undefined

  socketInstance = io(url, {
    transports: ['websocket', 'polling'],
    autoConnect: false,
    auth: cleanToken ? { token: cleanToken } : undefined,
    extraHeaders: cleanToken ? { Authorization: `Bearer ${cleanToken}` } : undefined,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  })

  return socketInstance
}

export function connectSocket(token = null) {
  const socket = getSocket(token)
  if (!socket.connected) {
    if (token) {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim()
      socket.auth = { token: cleanToken }
    }
    socket.connect()
  }
  return socket
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.removeAllListeners()
    socketInstance.disconnect()
    socketInstance = null
  }
}

/**
 * Subscribe to a socket event with automated listener removal
 */
export function onSocketEvent(socket, eventName, handler) {
  if (!socket) return () => {}
  socket.on(eventName, handler)
  return () => {
    socket.off(eventName, handler)
  }
}
