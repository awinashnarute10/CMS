import { apiClient, setStoredToken, clearStoredToken } from './client'

export function extractToken(response) {
  if (!response) return null
  if (typeof response === 'string') return response

  return (
    response.token ||
    response.access_token ||
    response.accessToken ||
    response.jwt ||
    response.jwtToken ||
    response.authToken ||
    response.data?.token ||
    response.data?.access_token ||
    response.data?.accessToken ||
    response.data?.jwt ||
    (typeof response.data === 'string' ? response.data : null) ||
    null
  )
}

export async function login({ email, password }) {
  const response = await apiClient.post('/auth/login', { email, password })
  
  // If response contains an error message or fails to provide a token
  const errorMessage = response?.errorMessage || response?.message || response?.error
  const token = extractToken(response)

  if (errorMessage && !token) {
    const error = new Error(errorMessage)
    error.status = 401
    error.isAuthError = true
    error.data = response
    throw error
  }

  if (!token) {
    const error = new Error('No authentication token received from server')
    error.status = 401
    error.isAuthError = true
    error.data = response
    throw error
  }

  setStoredToken(token)
  return response
}

export function logout() {
  clearStoredToken()
}

export async function checkSecureHealth() {
  return apiClient.get('/health/secure')
}
