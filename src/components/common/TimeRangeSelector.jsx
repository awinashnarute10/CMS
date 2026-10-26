import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export const TIME_PRESETS = [
  { id: '1h', label: 'Last 1h', durationMs: 1000 * 60 * 60 },
  { id: '6h', label: 'Last 6h', durationMs: 1000 * 60 * 60 * 6 },
  { id: '24h', label: 'Last 24h', durationMs: 1000 * 60 * 60 * 24 },
  { id: '7d', label: 'Last 7d', durationMs: 1000 * 60 * 60 * 24 * 7 },
]

export function computeRangeFromPreset(presetId = '24h') {
  const preset = TIME_PRESETS.find((p) => p.id === presetId) || TIME_PRESETS[2]
  const toUtc = Date.now()
  const fromUtc = toUtc - preset.durationMs
  return { fromUtc, toUtc, presetId: preset.id }
}

export function TimeRangeSelector({
  value = '24h',
  onChange,
  className,
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-lg bg-card border border-border text-xs shadow-subtle',
        className
      )}
      role="group"
      aria-label="Select analytics time range"
    >
      <div className="pl-2 pr-1 text-muted-foreground hidden sm:flex items-center">
        <Clock className="h-3.5 w-3.5" />
      </div>
      {TIME_PRESETS.map((preset) => {
        const isActive = value === preset.id
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange?.(preset.id)}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
              isActive
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
            aria-pressed={isActive}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}
