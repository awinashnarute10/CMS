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

    const currentHour = new Date().getHours()

    // 1. Map items to extract raw timestamp, hour, and demographics counts
    const mapped = data.map((item, index) => {
      const ts =
        item.timestamp ??
        item.hourUtc ??
        item.timeUtc ??
        item.fromUtc ??
        (item.hour && !isNaN(new Date(item.hour).getTime()) ? new Date(item.hour).getTime() : null)

      const hourNum =
        typeof item.hour === 'number' && item.hour >= 0 && item.hour < 24
          ? item.hour
          : typeof item.hour === 'string' && /^\d{1,2}$/.test(item.hour)
          ? Number(item.hour)
          : null

      return {
        ...item,
        timestamp: ts,
        hourNum,
        rawIndex: index,
        male: Number(item.male ?? 0),
        female: Number(item.female ?? 0),
        total: Number(item.male ?? 0) + Number(item.female ?? 0),
      }
    })

    // 2. Sort chronologically so the timeline flows from 24h ago to current hour
    const hasTimestamps = mapped.some((m) => typeof m.timestamp === 'number' && m.timestamp > 86400000)
    const hasHours = mapped.every((m) => m.hourNum !== null)

    if (hasTimestamps) {
      mapped.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
    } else if (hasHours && mapped.length > 1) {
      // Sort by hours ago descending: oldest (23 hours ago) first, newest (current hour, 0 hours ago) last
      mapped.sort((a, b) => {
        const agoA = (currentHour - a.hourNum + 24) % 24
        const agoB = (currentHour - b.hourNum + 24) % 24
        return agoB - agoA
      })
    }

    // 3. Assign 24h time labels (HH:MM or HH:00)
    return mapped.map((item, index) => {
      let timeLabel
      if (typeof item.timestamp === 'number' && !isNaN(item.timestamp) && item.timestamp > 86400000) {
        const d = new Date(item.timestamp)
        const hh = String(d.getHours()).padStart(2, '0')
        const mm = String(d.getMinutes()).padStart(2, '0')
        timeLabel = `${hh}:${mm}`
      } else if (item.hourNum !== null) {
        timeLabel = `${String(item.hourNum).padStart(2, '0')}:00`
      } else if (item.timeLabel && !item.timeLabel.startsWith('T+') && /^\d{1,2}:\d{2}/.test(item.timeLabel)) {
        timeLabel = item.timeLabel.slice(0, 5)
      } else if (item.time && !item.time.startsWith('T+') && /^\d{1,2}:\d{2}/.test(item.time)) {
        timeLabel = item.time.slice(0, 5)
      } else {
        const hour = (currentHour - (mapped.length - 1 - index) + 240) % 24
        timeLabel = `${String(hour).padStart(2, '0')}:00`
      }

      return {
        ...item,
        timeLabel,
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
              interval={chartData.length > 12 ? 1 : 0}
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
