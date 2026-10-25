import { useState } from 'react'
import { ThemeProvider } from '@/context/ThemeContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Users } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <ThemeProvider defaultTheme="system">
      <AppLayout
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      >
        <PageContainer>
          {activeTab === 'overview' ? (
            <>
              <PageHeader
                title="Overview"
                description="Live occupancy monitoring, footfall analytics, and zone alerts."
              />
              <Card className="border border-border bg-card shadow-none">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="h-10 w-10 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">
                      No Site Selected
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Select or configure a monitored site to stream live occupancy, dwell analytics, and simulation metrics.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <PageHeader
                title="Crowd Entries"
                description="Combined entry–exit session logs and visitor dwell tracking."
              />
              <Card className="border border-border bg-card shadow-none">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="h-10 w-10 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">
                      No Entry–Exit Logs Available
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Visitor sessions will be displayed here once connected to the backend analytics dataset.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </PageContainer>
      </AppLayout>
    </ThemeProvider>
  )
}

export default App
