import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { OverviewPage } from '@/pages/OverviewPage'
import { CrowdEntriesPage } from '@/pages/CrowdEntriesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/crowd-entries" element={<CrowdEntriesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  )
}
