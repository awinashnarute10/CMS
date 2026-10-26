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
    color: '#0B8F8B',
  },
}

export function OccupancyTimeChart({ data = [], height = 280 }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return []

    const currentHour = new Date().getHours()

    // 1. Map items to extract raw timestamp, hour, and counts
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

      const rawCount =
        typeof item.occupancy === 'number'
          ? item.occupancy
          : typeof item.avgOccupancy === 'number'
          ? item.avgOccupancy
          : typeof item.averageOccupancy === 'number'
          ? item.averageOccupancy
          : typeof item.avg === 'number'
          ? item.avg
          : typeof item.count === 'number'
          ? item.count
          : typeof item.value === 'number'
          ? item.value
          : typeof item.total === 'number'
          ? item.total
          : typeof item.occupants === 'number'
          ? item.occupants
          : typeof item.headcount === 'number'
          ? item.headcount
          : Number(
              item.occupancy ??
                item.avgOccupancy ??
                item.averageOccupancy ??
                item.avg ??
                item.count ??
                item.value ??
                0
            )

      return {
        ...item,
        timestamp: ts,
        hourNum,
        rawIndex: index,
        rawCount: Number.isNaN(rawCount) ? 0 : rawCount,
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
        occupancy: item.rawCount,
      }
    })
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center">
        <EmptyState
          title="No occupancy records"
          description="No occupancy records found for the selected time range."
        />
      </div>
    )
  }

  const peak = Math.max(...chartData.map((d) => d.occupancy), 0)
  const latest = chartData[chartData.length - 1]?.occupancy ?? 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-4 text-[#777B80]">
          <span>
            Latest: <strong className="font-semibold text-[#202124] font-mono tabular-nums">{latest}</strong> persons
          </span>
          <span>
            Peak: <strong className="font-semibold text-[#202124] font-mono tabular-nums">{peak}</strong> persons
          </span>
        </div>
        <span className="text-[11px] text-[#777B80] font-medium">Hourly resolution</span>
      </div>

      <ChartContainer
        config={chartConfig}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`Hourly occupancy timeline chart. Latest ${latest} persons, peak ${peak} persons.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
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
                  formatter={(val) => `${Number(val).toLocaleString()} persons`}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="occupancy"
              stroke="#0B8F8B"
              strokeWidth={2}
              fill="#0B8F8B"
              fillOpacity={0.12}
              activeDot={{ r: 4, stroke: '#0B8F8B', strokeWidth: 2, fill: '#FFFFFF' }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
