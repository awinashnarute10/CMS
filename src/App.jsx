import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/context/AuthContext'

const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const OverviewPage = lazy(() => import('@/pages/OverviewPage').then(m => ({ default: m.OverviewPage })))
const CrowdEntriesPage = lazy(() => import('@/pages/CrowdEntriesPage').then(m => ({ default: m.CrowdEntriesPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

function AuthWatcher() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login', { replace: true, state: { from: location } })
    }
  }, [isAuthenticated, location, navigate])

  return null
}

function RouteSuspense({ children }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <LoadingState message="Loading view..." />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export default function App() {
  return (
    <>
      <AuthWatcher />
      <Routes>
      {/* Public Authentication Route */}
      <Route
        path="/login"
        element={
          <RouteSuspense>
            <LoginPage />
          </RouteSuspense>
        }
      />

      {/* Protected Operations Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Navigate to="/overview" replace />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/overview"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RouteSuspense>
                <OverviewPage />
              </RouteSuspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/crowd-entries"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RouteSuspense>
                <CrowdEntriesPage />
              </RouteSuspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route
        path="*"
        element={
          <AppLayout>
            <RouteSuspense>
              <NotFoundPage />
            </RouteSuspense>
          </AppLayout>
        }
      />
    </Routes>
    </>
  )
}
