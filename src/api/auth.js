import { apiClient, setStoredToken, clearStoredToken } from './client'

export async function login({ email, password }) {
  const response = await apiClient.post('/auth/login', { email, password })
  // Handle token response: { token } or { jwt } or { accessToken }
  const token = response?.token || response?.accessToken || response?.jwt || (typeof response === 'string' ? response : null)
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
