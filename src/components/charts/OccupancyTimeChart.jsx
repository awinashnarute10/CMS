import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { EmptyState } from '@/components/common/EmptyState'

const chartConfig = {
  occupancy: {
    label: 'Occupancy',
    color: 'var(--chart-occupancy)',
  },
}

export function OccupancyTimeChart({ data = [], height = 280 }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return []

    return data.map((item, index) => {
      const ts = item.timestamp ?? item.hourUtc ?? (item.hour ? new Date(item.hour).getTime() : null)
      let timeLabel = item.timeLabel || item.time || ''

      if (!timeLabel && ts) {
        const d = new Date(ts)
        timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      } else if (!timeLabel) {
        timeLabel = `T+${index}h`
      }

      return {
        ...item,
        timestamp: ts,
        timeLabel,
        occupancy: typeof item.occupancy === 'number' ? item.occupancy : Number(item.count ?? 0),
      }
    })
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center">
        <EmptyState
          title="No occupancy records"
          description="Waiting for simulation activity or recorded sensor entries."
        />
      </div>
    )
  }

  const peak = Math.max(...chartData.map((d) => d.occupancy), 0)
  const latest = chartData[chartData.length - 1]?.occupancy ?? 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>
            Latest: <strong className="font-semibold text-foreground font-mono tabular-nums">{latest}</strong> persons
          </span>
          <span>
            Peak: <strong className="font-semibold text-foreground font-mono tabular-nums">{peak}</strong> persons
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground font-medium">Solid fill • Zero gradients</span>
      </div>

      <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
              opacity={0.6}
            />
            <XAxis
              dataKey="timeLabel"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              allowDecimals={false}
            />
            <Tooltip
              content={
                <ChartTooltip
                  formatter={(val) => `${Number(val).toLocaleString()} persons`}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="occupancy"
              stroke="var(--chart-occupancy)"
              strokeWidth={2}
              fill="var(--chart-occupancy)"
              fillOpacity={0.12}
              activeDot={{ r: 4, stroke: 'var(--chart-occupancy)', strokeWidth: 2, fill: 'var(--card)' }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
