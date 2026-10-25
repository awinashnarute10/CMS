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
  const token = extractToken(response)
  if (token) {
    setStoredToken(token)
  }
  return response
}

export function logout() {
  clearStoredToken()
}

export async function checkSecureHealth() {
  return apiClient.get('/health/secure')
}
