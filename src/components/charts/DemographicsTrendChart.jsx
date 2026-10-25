import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartLegend } from '@/components/ui/chart'
import { EmptyState } from '@/components/common/EmptyState'

const chartConfig = {
  male: {
    label: 'Male',
    color: 'var(--chart-male)',
  },
  female: {
    label: 'Female',
    color: 'var(--chart-female)',
  },
}

export function DemographicsTrendChart({ data = [], height = 280 }) {
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
        male: Number(item.male ?? 0),
        female: Number(item.female ?? 0),
        total: Number(item.male ?? 0) + Number(item.female ?? 0),
      }
    })
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center">
        <EmptyState
          title="No demographic trends"
          description="Waiting for demographic data from recorded visitor sessions."
        />
      </div>
    )
  }

  const totalMale = chartData.reduce((acc, d) => acc + d.male, 0)
  const totalFemale = chartData.reduce((acc, d) => acc + d.female, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>
            Total M: <strong className="font-semibold text-foreground font-mono tabular-nums">{totalMale}</strong>
          </span>
          <span>
            Total F: <strong className="font-semibold text-foreground font-mono tabular-nums">{totalFemale}</strong>
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground font-medium">Hourly gender breakdown</span>
      </div>

      <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
                  formatter={(val, name) => `${Number(val).toLocaleString()} ${name}`}
                />
              }
            />
            <Legend content={<ChartLegend />} />
            <Line
              type="monotone"
              dataKey="male"
              stroke="var(--chart-male)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--chart-male)' }}
              activeDot={{ r: 5, stroke: 'var(--chart-male)', strokeWidth: 2, fill: 'var(--card)' }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="female"
              stroke="var(--chart-female)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--chart-female)' }}
              activeDot={{ r: 5, stroke: 'var(--chart-female)', strokeWidth: 2, fill: 'var(--card)' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
