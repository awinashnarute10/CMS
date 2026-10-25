import { useState } from 'react'
import { Play, Square, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { startSimulation, stopSimulation } from '@/api/simulation'
import { cn } from '@/lib/utils'

export function SimulationControl({ className }) {
  const [isRunning, setIsRunning] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (isRunning) {
        await stopSimulation()
        setIsRunning(false)
        toast.info('Occupancy simulation stopped')
      } else {
        await startSimulation()
        setIsRunning(true)
        toast.success('Live occupancy simulation started (1000 synthetic visitors)')
      }
    } catch (err) {
      toast.error(err.message || 'Simulation command failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant={isRunning ? 'outline' : 'secondary'}
        size="sm"
        disabled={loading}
        onClick={handleToggle}
        className={cn(
          'h-8 text-xs font-medium gap-1.5 transition-colors border',
          isRunning
            ? 'border-[var(--status-danger-border)] text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)]'
            : 'border-border text-foreground hover:bg-secondary'
        )}
        aria-label={isRunning ? 'Stop live occupancy simulation' : 'Start live occupancy simulation'}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isRunning ? (
          <Square className="h-3 w-3 fill-current" />
        ) : (
          <Play className="h-3 w-3 fill-current text-primary" />
        )}
        <span>{isRunning ? 'Stop Sim' : 'Start Sim'}</span>
      </Button>
    </div>
  )
}
