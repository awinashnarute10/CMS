import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { OverviewPage } from '@/pages/OverviewPage'
import { CrowdEntriesPage } from '@/pages/CrowdEntriesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<LoginPage />} />

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
              <OverviewPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/crowd-entries"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CrowdEntriesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route
        path="*"
        element={
          <AppLayout>
            <NotFoundPage />
          </AppLayout>
        }
      />
    </Routes>
  )
}
