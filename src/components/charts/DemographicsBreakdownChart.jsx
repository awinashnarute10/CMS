import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
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

export function DemographicsBreakdownChart({ data = [], height = 280 }) {
  const { pieData, total, maleCount, femaleCount, malePct, femalePct } = useMemo(() => {
    let male = 0
    let female = 0

    if (Array.isArray(data)) {
      data.forEach((item) => {
        male += Number(item.male ?? 0)
        female += Number(item.female ?? 0)
      })
    } else if (data && typeof data === 'object') {
      male = Number(data.male ?? 0)
      female = Number(data.female ?? 0)
    }

    const sum = male + female
    const mPct = sum > 0 ? Math.round((male / sum) * 100) : 0
    const fPct = sum > 0 ? Math.round((female / sum) * 100) : 0

    const list = sum > 0
      ? [
          { name: 'Male', value: male, color: 'var(--chart-male)', pct: mPct },
          { name: 'Female', value: female, color: 'var(--chart-female)', pct: fPct },
        ]
      : []

    return {
      pieData: list,
      total: sum,
      maleCount: male,
      femaleCount: female,
      malePct: mPct,
      femalePct: fPct,
    }
  }, [data])

  if (pieData.length === 0 || total === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center">
        <EmptyState
          title="No demographic breakdown"
          description="Waiting for classified visitor sessions."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative flex items-center justify-center" style={{ height: height - 50 }}>
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(val, name, item) =>
                      `${Number(val).toLocaleString()} (${item.payload?.pct ?? 0}%)`
                    }
                  />
                }
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Center label inside donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold tracking-tight text-foreground font-mono tabular-nums">
            {total.toLocaleString()}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Total
          </span>
        </div>
      </div>

      {/* Breakdown Legend details */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
        <div className="p-2 rounded bg-secondary/40 border border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--chart-male)' }} />
            <span className="text-muted-foreground">Male</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-foreground font-mono tabular-nums">{maleCount.toLocaleString()}</span>
            <span className="text-[11px] text-muted-foreground ml-1 font-mono">({malePct}%)</span>
          </div>
        </div>

        <div className="p-2 rounded bg-secondary/40 border border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--chart-female)' }} />
            <span className="text-muted-foreground">Female</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-foreground font-mono tabular-nums">{femaleCount.toLocaleString()}</span>
            <span className="text-[11px] text-muted-foreground ml-1 font-mono">({femalePct}%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
