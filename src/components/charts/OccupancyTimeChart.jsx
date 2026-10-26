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

    return data.map((item, index) => {
      const ts = item.timestamp ?? item.hourUtc ?? (item.hour ? new Date(item.hour).getTime() : null)
      let timeLabel = item.timeLabel || item.time || ''

      if (!timeLabel && ts) {
        const d = new Date(ts)
        timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      } else if (!timeLabel) {
        timeLabel = `T+${index}h`
      }

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
        timeLabel,
        occupancy: Number.isNaN(rawCount) ? 0 : rawCount,
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
