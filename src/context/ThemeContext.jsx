import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const THEME_STORAGE_KEY = 'cms-theme'

const ThemeContext = createContext({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => null,
  toggleTheme: () => null,
})

export function ThemeProvider({ children, defaultTheme = 'light' }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored === 'dark' || stored === 'light') return stored
      return defaultTheme
    } catch {
      return defaultTheme
    }
  })

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(THEME_STORAGE_KEY) : null
      return stored === 'dark' ? 'dark' : 'light'
    } catch {
      return defaultTheme
    }
  })

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === 'dark'
    setResolvedTheme(isDark ? 'dark' : 'light')

    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Storage unavailable or disabled
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
