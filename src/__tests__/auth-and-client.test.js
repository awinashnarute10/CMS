import { describe, it, expect, beforeEach, vi } from 'vitest'
import { parseJwt, isTokenExpired, extractUserFromToken } from '@/lib/jwt'
import { extractToken, login } from '@/api/auth'
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  subscribeUnauthorized,
  apiClient,
} from '@/api/client'

describe('JWT Utilities', () => {
  const futureExp = Math.floor(Date.now() / 1000) + 3600 // 1 hr in future
  const pastExp = Math.floor(Date.now() / 1000) - 3600 // 1 hr in past

  const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
    JSON.stringify({
      sub: 'usr-123',
      email: 'admin@kloudspot.com',
      name: 'System Admin',
      role: 'admin',
      exp: futureExp,
    })
  )}.signature`

  const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
    JSON.stringify({
      sub: 'usr-999',
      email: 'expired@kloudspot.com',
      exp: pastExp,
    })
  )}.signature`

  it('correctly parses valid JWT payload', () => {
    const payload = parseJwt(validToken)
    expect(payload).not.toBeNull()
    expect(payload.email).toBe('admin@kloudspot.com')
    expect(payload.role).toBe('admin')
  })

  it('correctly identifies active vs expired tokens', () => {
    expect(isTokenExpired(validToken)).toBe(false)
    expect(isTokenExpired(expiredToken)).toBe(true)
    expect(isTokenExpired('invalid-token')).toBe(false)
    expect(isTokenExpired(null)).toBe(false)
  })

  it('extracts standardized user profile from token claims', () => {
    const user = extractUserFromToken(validToken)
    expect(user).toEqual({
      id: 'usr-123',
      email: 'admin@kloudspot.com',
      role: 'admin',
      name: 'System Admin',
    })
  })
})

describe('Auth Service & Token Extraction', () => {
  beforeEach(() => {
    clearStoredToken()
    vi.restoreAllMocks()
  })

  it('extracts tokens from multiple backend response shapes', () => {
    expect(extractToken('raw-jwt-string')).toBe('raw-jwt-string')
    expect(extractToken({ token: 'tok-1' })).toBe('tok-1')
    expect(extractToken({ access_token: 'tok-2' })).toBe('tok-2')
    expect(extractToken({ accessToken: 'tok-3' })).toBe('tok-3')
    expect(extractToken({ data: { token: 'tok-4' } })).toBe('tok-4')
    expect(extractToken(null)).toBeNull()
  })

  it('stores and clears token in local storage safely', () => {
    setStoredToken('test-bearer-token')
    expect(getStoredToken()).toBe('test-bearer-token')

    clearStoredToken()
    expect(getStoredToken()).toBeNull()
  })

  it('rejects when server returns { errorMessage: "Invalid credentials" } without token', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      errorMessage: 'Invalid credentials',
    })

    await expect(
      login({ email: 'wrong@example.com', password: 'badpassword' })
    ).rejects.toThrow('Invalid credentials')

    expect(getStoredToken()).toBeNull()
  })

  it('rejects and does not forge fallback token when server returns 401', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValueOnce({
      status: 401,
      isAuthError: true,
      message: 'Invalid credentials',
    })

    await expect(
      login({ email: 'wrong@example.com', password: 'badpassword' })
    ).rejects.toMatchObject({
      status: 401,
      isAuthError: true,
      message: 'Invalid credentials',
    })

    expect(getStoredToken()).toBeNull()
  })
})

describe('Axios Client Interceptors & Normalization', () => {
  beforeEach(() => {
    clearStoredToken()
  })

  it('attaches sanitized Bearer token to request headers', async () => {
    setStoredToken('Bearer eyJmytoken123')
    const config = await apiClient.interceptors.request.handlers[0].fulfilled({
      headers: {},
    })
    expect(config.headers.Authorization).toBe('Bearer eyJmytoken123')
  })

  it('handles 401 unauthorized response and dispatches eviction listener', async () => {
    const mockListener = vi.fn()
    const unsubscribe = subscribeUnauthorized(mockListener)

    setStoredToken('active-token')
    const responseInterceptorError = apiClient.interceptors.response.handlers[0].rejected

    try {
      await responseInterceptorError({
        response: {
          status: 401,
          data: { errorMessage: 'Invalid credentials or session expired' },
        },
      })
    } catch (normalizedError) {
      expect(normalizedError.status).toBe(401)
      expect(normalizedError.isAuthError).toBe(true)
      expect(normalizedError.isClientError).toBe(true)
      expect(normalizedError.message).toBe('Invalid credentials or session expired')
      expect(getStoredToken()).toBeNull() // Cleared token
      expect(mockListener).toHaveBeenCalledTimes(1)
    } finally {
      unsubscribe()
    }
  })

  it('normalizes network errors gracefully without crashing', async () => {
    const responseInterceptorError = apiClient.interceptors.response.handlers[0].rejected

    try {
      await responseInterceptorError({
        request: {}, // Request sent, no response received
        message: 'Network Error',
      })
    } catch (normalizedError) {
      expect(normalizedError.isNetworkError).toBe(true)
      expect(normalizedError.message).toContain('unexpected network error')
    }
  })

  it('dispatches eviction when response contains "Missing Authorization header"', async () => {
    const mockListener = vi.fn()
    const unsubscribe = subscribeUnauthorized(mockListener)
    setStoredToken('active-token')

    const responseInterceptorError = apiClient.interceptors.response.handlers[0].rejected

    try {
      await responseInterceptorError({
        config: { url: '/api/sites' },
        response: {
          status: 401,
          data: { message: 'Missing Authorization header' },
        },
      })
    } catch (err) {
      expect(err.isAuthError).toBe(true)
      expect(getStoredToken()).toBeNull()
      expect(mockListener).toHaveBeenCalledTimes(1)
    } finally {
      unsubscribe()
    }
  })

  it('dispatches eviction when response contains "Invalid or expired token"', async () => {
    const mockListener = vi.fn()
    const unsubscribe = subscribeUnauthorized(mockListener)
    setStoredToken('active-token')

    const responseInterceptorError = apiClient.interceptors.response.handlers[0].rejected

    try {
      await responseInterceptorError({
        config: { url: '/api/analytics/occupancy' },
        response: {
          status: 401,
          data: { message: 'Invalid or expired token' },
        },
      })
    } catch (err) {
      expect(err.isAuthError).toBe(true)
      expect(getStoredToken()).toBeNull()
      expect(mockListener).toHaveBeenCalledTimes(1)
    } finally {
      unsubscribe()
    }
  })

  it('dispatches eviction even if server returns 200 OK with "Invalid or expired token" payload', async () => {
    const mockListener = vi.fn()
    const unsubscribe = subscribeUnauthorized(mockListener)
    setStoredToken('active-token')

    const responseInterceptorSuccess = apiClient.interceptors.response.handlers[0].fulfilled

    try {
      await responseInterceptorSuccess({
        status: 200,
        config: { url: '/api/sites' },
        data: { message: 'Invalid or expired token' },
      })
    } catch (err) {
      expect(err.isAuthError).toBe(true)
      expect(getStoredToken()).toBeNull()
      expect(mockListener).toHaveBeenCalledTimes(1)
    } finally {
      unsubscribe()
    }
  })
})
