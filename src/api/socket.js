import { io } from 'socket.io-client'
import { getStoredToken } from './client'

let socketInstance = null

export function getSocketOrigin() {
  const rawBaseUrl = import.meta.env.VITE_BASE_URL?.trim() || 'https://hiring-dev.internal.kloudspot.com/api'
  const clean = rawBaseUrl.replace(/["']/g, '')
  try {
    const url = new URL(clean)
    return url.origin
  } catch {
    return 'https://hiring-dev.internal.kloudspot.com'
  }
}

export function initSocket() {
  if (socketInstance) {
    return socketInstance
  }

  const origin = getSocketOrigin()
  const token = getStoredToken()

  socketInstance = io(origin, {
    transports: ['websocket', 'polling'],
    autoConnect: false,
    auth: {
      token: token ? `Bearer ${token}` : undefined,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  return socketInstance
}

export function connectSocket() {
  const socket = initSocket()
  if (!socket.connected) {
    const token = getStoredToken()
    if (token) {
      socket.auth = { token: `Bearer ${token}` }
    }
    socket.connect()
  }
  return socket
}

export function disconnectSocket() {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect()
  }
}
