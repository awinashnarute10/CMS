import axios from 'axios'

const TOKEN_KEY = 'cms_access_token'
let inMemoryToken = null
let unauthorizedListeners = []

export function subscribeUnauthorized(listener) {
  unauthorizedListeners.push(listener)
  return () => {
    unauthorizedListeners = unauthorizedListeners.filter((l) => l !== listener)
  }
}

export function getStoredToken() {
  if (inMemoryToken) return inMemoryToken
  try {
    const saved = localStorage.getItem(TOKEN_KEY) || null
    inMemoryToken = saved
    return saved
  } catch {
    return null
  }
}

export function setStoredToken(token) {
  inMemoryToken = token
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    // Storage access issue
  }
}

export function clearStoredToken() {
  inMemoryToken = null
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage access issue
  }
}

// Clean and validate base URL from environment
const rawBaseUrl = import.meta.env.VITE_BASE_URL?.trim() || 'https://hiring-dev.internal.kloudspot.com/api'
const baseURL = rawBaseUrl.replace(/["']/g, '').replace(/\/+$/, '')

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Attach Bearer token to all outgoing REST requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken()
    if (token) {
      // Ensure clean 'Bearer <token>' format without duplicate prefix
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      config.headers.Authorization = authHeader
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Intercept responses to normalize errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const data = error.response?.data

    // Normalize error message from backend
    const message =
      data?.errorMessage ||
      data?.message ||
      (status === 401 ? 'Authentication required or session expired' : error.message)

    if (status === 401) {
      // Discard invalid token if server rejects it
      clearStoredToken()
      unauthorizedListeners.forEach((fn) => {
        try {
          fn()
        } catch {
          // ignore callback error
        }
      })
    }

    return Promise.reject({
      status,
      message,
      data,
      originalError: error,
    })
  }
)
