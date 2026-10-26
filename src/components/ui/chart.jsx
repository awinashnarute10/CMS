import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { cn } from '@/lib/utils'

// Format: { [key: string]: { label?: React.ReactNode, icon?: React.ComponentType, color?: string, theme?: Record<string, string> } }
const ChartContext = React.createContext(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }
  return context
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/20 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

export function ChartStyle({ id, config }) {
  const colorConfig = Object.entries(config || {}).filter(
    ([, item]) => item.theme || item.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .map(([key, item]) => {
            const color = item.color || item.theme?.light
            return color ? `[data-chart=${id}] { --color-${key}: ${color}; }` : ''
          })
          .join('\n'),
      }}
    />
  )
}

export function ChartTooltip({
  active,
  payload,
  label,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  className,
  formatter,
  labelFormatter,
}) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        'min-w-[8rem] rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-none',
        className
      )}
    >
      {!hideLabel && (
        <div className="font-medium text-foreground mb-1 pb-1 border-b border-border/50">
          {labelFormatter ? labelFormatter(label, payload) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const key = item.dataKey || item.name || 'value'
          const itemConfig = config?.[key] || {}
          const itemColor = item.color || item.payload?.fill || itemConfig.color || 'var(--primary)'
          const itemLabel = itemConfig.label || item.name || key

          return (
            <div
              key={`${key}-${index}`}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-1.5">
                {!hideIndicator && (
                  indicator === 'dot' ? (
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: itemColor }}
                    />
                  ) : (
                    <span
                      className="h-0.5 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: itemColor }}
                    />
                  )
                )}
                <span className="text-muted-foreground">{itemLabel}</span>
              </div>
              <span className="font-mono font-medium text-foreground tabular-nums">
                {formatter ? formatter(item.value, item.name, item, index, payload) : item.value?.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ChartLegend({ payload, className }) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-4 pt-3 text-xs', className)}>
      {payload.map((item, index) => {
        const key = item.dataKey || item.value
        const itemConfig = config?.[key] || {}
        const itemColor = item.color || itemConfig.color || 'var(--primary)'
        const itemLabel = itemConfig.label || item.value

        return (
          <div key={`legend-${index}`} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: itemColor }}
            />
            <span className="text-muted-foreground">{itemLabel}</span>
          </div>
        )
      })}
    </div>
  )
}
