'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import moment from 'moment-timezone'
import { formatCurrency, IST_TIMEZONE } from '@/lib/utils'

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

// 30-min intraday slots
const SLOT_COUNT = 48
const SLOT_MINUTES = 30

function buildIntradayPoints(
  graphHistory: HistoryItem[],
  currentBalance: number,
  dayStart: moment.Moment,
  now: moment.Moment,
  isFuture = false,
) {
  const slots: { date: string; balance: number | null }[] = Array.from(
    { length: SLOT_COUNT },
    (_, i) => ({
      date: dayStart.clone().add(i * SLOT_MINUTES, 'minutes').format('hh:mm A'),
      balance: null,
    }),
  )

  const opening = graphHistory.length > 0 ? graphHistory[0].balance : currentBalance
  slots[0].balance = opening

  for (const h of graphHistory) {
    const ts = moment(h.createdAt).tz(IST_TIMEZONE)
    const idx = Math.floor(ts.diff(dayStart, 'minutes') / SLOT_MINUTES)
    if (idx >= 0 && idx < SLOT_COUNT) slots[idx].balance = h.balance
  }

  const endIdx = isFuture
    ? SLOT_COUNT - 1
    : Math.min(Math.floor(now.diff(dayStart, 'minutes') / SLOT_MINUTES), SLOT_COUNT - 1)

  if (!isFuture && endIdx >= 0) slots[endIdx].balance = currentBalance

  // Forward-fill up to endIdx
  let last: number | null = null
  for (let i = 0; i <= endIdx; i++) {
    if (slots[i].balance !== null) last = slots[i].balance
    else if (last !== null) slots[i].balance = last
  }

  return slots
}


function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload?.length && payload[0].value != null) {
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
  const { data, openingBalance, isPositive, yMin, yMax } = useMemo(() => {
    const now = moment().tz(IST_TIMEZONE)

    const graphHistory = history
      .filter((h) => h.type === 'graph_credit' || h.type === 'graph_debit')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    const rangeStart = now.clone().startOf('day')
    const inRange = graphHistory.filter((h) =>
      moment(h.createdAt).tz(IST_TIMEZONE).isSameOrAfter(rangeStart),
    )
    const points = buildIntradayPoints(inRange, currentBalance, rangeStart, now)

    const opening = points.find((p) => p.balance !== null)?.balance ?? currentBalance
    const current = currentBalance

    const balances = points.map((p) => p.balance).filter((b): b is number => b !== null)
    const minBal = balances.length ? Math.min(...balances) : 0
    const maxBal = balances.length ? Math.max(...balances) : 0
    const spread = maxBal - minBal
    const minPad = (maxBal || 1) * 0.05
    const pad = Math.max(spread * 0.4, minPad)

    return {
      data: points,
      openingBalance: opening,
      isPositive: current >= opening,
      yMin: minBal - pad,
      yMax: maxBal + pad,
    }
  }, [history, currentBalance])

  const color = isPositive ? '#10b981' : '#ef4444'

  return (
    <div className="h-48 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="balGradGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="balGradRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,61,0.5)" />
            <XAxis dataKey="date" hide />
            <YAxis hide domain={[yMin, yMax]} />

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine
              y={openingBalance}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="4 4"
            />

            <Area
              type="monotone"
              dataKey="balance"
              stroke={color}
              strokeWidth={2}
              fill={isPositive ? 'url(#balGradGreen)' : 'url(#balGradRed)'}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 4, fill: color, stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
  )
}
