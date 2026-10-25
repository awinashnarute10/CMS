import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { SiteProvider } from '@/context/SiteContext'
import { SocketProvider } from '@/context/SocketContext'
import { Toaster } from '@/components/ui/sonner'

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <SiteProvider>
            <SocketProvider>
              <BrowserRouter>
                {children}
                <Toaster />
              </BrowserRouter>
            </SocketProvider>
          </SiteProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
