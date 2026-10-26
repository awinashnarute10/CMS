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
    // Storage access failure
  }
}

export function clearStoredToken() {
  inMemoryToken = null
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage access failure
  }
}

// Clean and validate base URL from environment variable
const rawBaseUrl = import.meta.env.VITE_BASE_URL?.trim() || 'https://hiring-dev.internal.kloudspot.com/api'
const baseURL = rawBaseUrl.replace(/["']/g, '').replace(/\/+$/, '')

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

// Attach Bearer token to all outgoing REST requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken()
    if (token) {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim()
      config.headers.Authorization = `Bearer ${cleanToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export function dispatchUnauthorized() {
  clearStoredToken()
  unauthorizedListeners.forEach((fn) => {
    try {
      fn()
    } catch {
      // ignore callback error
    }
  })
}

export function isAuthEvictionResponse(status, data) {
  if (status === 401 || status === 403) return true
  const msg = (
    data?.message ||
    data?.errorMessage ||
    data?.error ||
    (typeof data === 'string' ? data : '')
  ).toLowerCase()

  if (
    msg.includes('missing authorization header') ||
    msg.includes('invalid or expired token') ||
    msg.includes('expired token') ||
    msg.includes('token expired') ||
    msg.includes('jwt expired') ||
    msg.includes('unauthorized') ||
    msg.includes('invalid token')
  ) {
    return true
  }
  return false
}

// Intercept responses for predictable, normalized error objects
apiClient.interceptors.response.use(
  (response) => {
    const data = response?.data
    const status = response?.status
    const url = response?.config?.url || ''
    const isLoginEndpoint = url.includes('/auth/login')

    // Catch cases where API returns 200 OK but payload indicates missing/invalid token
    if (isAuthEvictionResponse(status, data) && !isLoginEndpoint) {
      dispatchUnauthorized()
      return Promise.reject({
        status: 401,
        message: data?.message || data?.errorMessage || 'Invalid or expired token',
        data,
        isAuthError: true,
      })
    }
    return data
  },
  (error) => {
    // Ignore aborted requests without triggering auth eviction
    if (axios.isCancel(error)) {
      return Promise.reject({
        isCancelled: true,
        message: 'Request was cancelled',
      })
    }

    const status = error.response?.status
    const data = error.response?.data
    const url = error.config?.url || ''
    const isNetworkError = !error.response && Boolean(error.request)

    // Normalize user-safe error message
    let message = 'An unexpected network error occurred. Please check your connection.'
    if (data?.errorMessage) {
      message = data.errorMessage
    } else if (data?.message) {
      message = data.message
    } else if (isNetworkError) {
      message = 'An unexpected network error occurred. Please check your connection.'
    } else if (status === 401) {
      message = 'Authentication required or session expired.'
    } else if (status === 403) {
      message = 'You do not have permission to perform this action.'
    } else if (status === 404) {
      message = 'Requested resource not found.'
    } else if (status >= 500) {
      message = 'The server encountered an error processing your request.'
    } else if (error.message) {
      message = error.message
    }

    const isLoginEndpoint = url.includes('/auth/login')
    const shouldEvict = isAuthEvictionResponse(status, data) && !isLoginEndpoint

    if (shouldEvict) {
      dispatchUnauthorized()
    }

    return Promise.reject({
      status,
      message,
      data,
      isNetworkError,
      isAuthError: status === 401 || status === 403 || shouldEvict,
      isClientError: typeof status === 'number' && status >= 400 && status < 500,
    })
  }
)
