import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <PageContainer>
      <Card className="border border-border bg-card shadow-none">
        <CardContent className="p-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground">
            <FileQuestion className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground">Page Not Found</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              The requested view does not exist in the Crowd Management System.
            </p>
          </div>
          <Button onClick={() => navigate('/overview')} size="sm">
            Return to Overview
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
