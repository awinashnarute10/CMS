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
    color: '#0B8F8B',
  },
  female: {
    label: 'Female',
    color: '#718486',
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
          description="No demographic trend data found for the selected time range."
        />
      </div>
    )
  }

  const totalMale = chartData.reduce((acc, d) => acc + d.male, 0)
  const totalFemale = chartData.reduce((acc, d) => acc + d.female, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-4 text-[#777B80]">
          <span>
            Total M: <strong className="font-semibold text-[#202124] font-mono tabular-nums">{totalMale}</strong>
          </span>
          <span>
            Total F: <strong className="font-semibold text-[#202124] font-mono tabular-nums">{totalFemale}</strong>
          </span>
        </div>
        <span className="text-[11px] text-[#777B80] font-medium">Hourly gender breakdown</span>
      </div>

      <ChartContainer
        config={chartConfig}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`Demographics trend chart. Total male visitors ${totalMale}, total female visitors ${totalFemale}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#D9DCDD"
              vertical={false}
              opacity={0.8}
            />
            <XAxis
              dataKey="timeLabel"
              stroke="#777B80"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#D9DCDD' }}
            />
            <YAxis
              stroke="#777B80"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#D9DCDD' }}
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
              stroke="#0B8F8B"
              strokeWidth={2}
              dot={{ r: 3, fill: '#0B8F8B' }}
              activeDot={{ r: 5, stroke: '#0B8F8B', strokeWidth: 2, fill: '#FFFFFF' }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="female"
              stroke="#718486"
              strokeWidth={2}
              dot={{ r: 3, fill: '#718486' }}
              activeDot={{ r: 5, stroke: '#718486', strokeWidth: 2, fill: '#FFFFFF' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
