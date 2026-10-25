import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from '@/context/ThemeContext'
import { SiteProvider } from '@/context/SiteContext'
import { Toaster } from '@/components/ui/sonner'

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <SiteProvider>
          <BrowserRouter>
            {children}
            <Toaster />
          </BrowserRouter>
        </SiteProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
