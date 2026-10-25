export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return false
  // Check if expiration is within the past (with 5s buffer)
  return payload.exp * 1000 < Date.now() + 5000
}

export function extractUserFromToken(token) {
  const payload = parseJwt(token)
  if (!payload) return null

  return {
    id: payload.sub || payload.id || payload.userId || null,
    email: payload.email || payload.username || null,
    role: payload.role || (payload.admin ? 'admin' : 'viewer'),
    name: payload.name || payload.email?.split('@')[0] || 'User',
  }
}
