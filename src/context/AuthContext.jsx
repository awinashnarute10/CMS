import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getStoredToken, setStoredToken, clearStoredToken, subscribeUnauthorized } from '@/api/client'
import * as authApi from '@/api/auth'
import { extractUserFromToken, isTokenExpired } from '@/lib/jwt'
import { queryClient } from '@/lib/queryClient'
import { disconnectSocket } from '@/api/socket'

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => null,
  logout: () => null,
})

function getInitialAuthState() {
  const savedToken = getStoredToken()
  if (savedToken && !isTokenExpired(savedToken)) {
    return {
      token: savedToken,
      user: extractUserFromToken(savedToken),
    }
  }
  if (savedToken) {
    clearStoredToken()
  }
  return { token: null, user: null }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => getInitialAuthState())

  const logout = useCallback(() => {
    clearStoredToken()
    setAuthState({ token: null, user: null })
    disconnectSocket()
    queryClient.clear()
  }, [])

  // Subscribe to 401 unauthorized events to evict session
  useEffect(() => {
    const unsubscribe = subscribeUnauthorized(() => {
      logout()
    })
    return () => unsubscribe()
  }, [logout])

  const login = async ({ email, password }) => {
    const response = await authApi.login({ email, password })
    const extractedToken = authApi.extractToken(response)

    if (extractedToken) {
      setStoredToken(extractedToken)
      const parsedUser = extractUserFromToken(extractedToken) || {
        email,
        name: email.split('@')[0],
        role: 'operator',
      }
      setAuthState({ token: extractedToken, user: parsedUser })
    }

    return response
  }

  const isAuthenticated = Boolean(
    authState.token && !isTokenExpired(authState.token)
  )

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        token: authState.token,
        isAuthenticated,
        isLoading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
