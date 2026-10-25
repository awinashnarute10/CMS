import { createContext, useContext, useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'cms-theme'

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null,
})

export function ThemeProvider({ children, defaultTheme = 'system' }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || defaultTheme
    } catch {
      return defaultTheme
    }
  })

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const stored = localStorage.getItem(THEME_STORAGE_KEY) || defaultTheme
    return stored === 'dark' || (stored === 'system' && prefersDark) ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches)
      const currentResolved = isDark ? 'dark' : 'light'
      setResolvedTheme(currentResolved)

      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    applyTheme()

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Storage unavailable or disabled
    }

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
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
