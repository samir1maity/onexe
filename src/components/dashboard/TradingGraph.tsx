'use client'

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
import { formatCurrency } from '@/lib/utils'

interface HistoryItem {
  id: string
  balance: number
  type: string
  note?: string | null
  createdAt: string
}

interface Props {
  history: HistoryItem[]
  currentBalance: number
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="text-white font-semibold">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function TradingGraph({ history, currentBalance }: Props) {
  const data = useMemo(() => {
    if (history.length === 0) {
      const now = new Date()
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (6 - i))
        return {
          date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          balance: 0,
        }
      })
    }

    const graphHistory = history.filter(
      (h) => h.type === 'graph_credit' || h.type === 'graph_debit'
    )

    if (graphHistory.length === 0) {
      const now = new Date()
      const points = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (6 - i))
        return {
          date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          balance: i === 6 ? currentBalance : 0,
        }
      })
      return points
    }

    const points = graphHistory.map((h) => ({
      date: new Date(h.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      balance: h.balance,
    }))

    points.push({
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      balance: currentBalance,
    })

    return points
  }, [history, currentBalance])

  const isPositive = data.length < 2 || data[data.length - 1].balance >= data[0].balance
  const gradientColor = isPositive ? '#10b981' : '#ef4444'
  const strokeColor = isPositive ? '#10b981' : '#ef4444'

  return (
    <div className="h-48 sm:h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={gradientColor} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,61,0.5)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${v.toFixed(0)}`}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={strokeColor}
            strokeWidth={2}
            fill="url(#balanceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: strokeColor, stroke: 'white', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
