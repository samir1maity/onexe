'use client'

import { useMemo, useState } from 'react'
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

type Filter = 'today' | 'yesterday' | '7d' | 'this_month' | 'last_month' | '3m'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'today',      label: 'Today' },
  { key: 'yesterday',  label: 'Yesterday' },
  { key: '7d',         label: '7 Days' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: '3m',         label: '3 Months' },
]

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

function buildDailyPoints(
  graphHistory: HistoryItem[],
  currentBalance: number,
  rangeStart: moment.Moment,
  now: moment.Moment,
) {
  const days = Math.ceil(now.diff(rangeStart, 'days', true))
  const slots: { date: string; balance: number | null }[] = Array.from(
    { length: days },
    (_, i) => ({
      date: rangeStart.clone().add(i, 'days').format('MMM D'),
      balance: null,
    }),
  )

  // Opening = first known balance before rangeStart or first history item
  const opening = graphHistory.length > 0 ? graphHistory[0].balance : currentBalance
  if (slots.length > 0) slots[0].balance = opening

  for (const h of graphHistory) {
    const ts = moment(h.createdAt).tz(IST_TIMEZONE)
    const idx = Math.floor(ts.diff(rangeStart, 'days', true))
    if (idx >= 0 && idx < slots.length) slots[idx].balance = h.balance
  }

  // Last slot = current balance
  if (slots.length > 0) slots[slots.length - 1].balance = currentBalance

  // Forward-fill
  let last: number | null = null
  for (const s of slots) {
    if (s.balance !== null) last = s.balance
    else if (last !== null) s.balance = last
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
  const [filter, setFilter] = useState<Filter>('today')

  const { data, openingBalance, isPositive, yMin, yMax } = useMemo(() => {
    const now = moment().tz(IST_TIMEZONE)

    const graphHistory = history
      .filter((h) => h.type === 'graph_credit' || h.type === 'graph_debit')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    let points: { date: string; balance: number | null }[]
    let rangeStart: moment.Moment

    if (filter === 'today') {
      rangeStart = now.clone().startOf('day')
      const inRange = graphHistory.filter((h) =>
        moment(h.createdAt).tz(IST_TIMEZONE).isSameOrAfter(rangeStart),
      )
      points = buildIntradayPoints(inRange, currentBalance, rangeStart, now)
    } else if (filter === 'yesterday') {
      rangeStart = now.clone().subtract(1, 'day').startOf('day')
      const dayEnd = rangeStart.clone().endOf('day')
      const inRange = graphHistory.filter((h) => {
        const ts = moment(h.createdAt).tz(IST_TIMEZONE)
        return ts.isSameOrAfter(rangeStart) && ts.isSameOrBefore(dayEnd)
      })
      // For yesterday, last known balance = last event of the day or currentBalance
      const lastBalance = inRange.length > 0
        ? inRange[inRange.length - 1].balance
        : currentBalance
      points = buildIntradayPoints(inRange, lastBalance, rangeStart, dayEnd, true)
    } else if (filter === '7d') {
      rangeStart = now.clone().subtract(6, 'days').startOf('day')
      const inRange = graphHistory.filter((h) =>
        moment(h.createdAt).tz(IST_TIMEZONE).isSameOrAfter(rangeStart),
      )
      points = buildDailyPoints(inRange, currentBalance, rangeStart, now)
    } else if (filter === 'this_month') {
      rangeStart = now.clone().startOf('month')
      const inRange = graphHistory.filter((h) =>
        moment(h.createdAt).tz(IST_TIMEZONE).isSameOrAfter(rangeStart),
      )
      points = buildDailyPoints(inRange, currentBalance, rangeStart, now)
    } else if (filter === 'last_month') {
      rangeStart = now.clone().subtract(1, 'month').startOf('month')
      const rangeEnd = now.clone().subtract(1, 'month').endOf('month')
      const inRange = graphHistory.filter((h) => {
        const ts = moment(h.createdAt).tz(IST_TIMEZONE)
        return ts.isSameOrAfter(rangeStart) && ts.isSameOrBefore(rangeEnd)
      })
      const lastBalance = inRange.length > 0
        ? inRange[inRange.length - 1].balance
        : currentBalance
      const days = rangeEnd.diff(rangeStart, 'days') + 1
      const slots: { date: string; balance: number | null }[] = Array.from({ length: days }, (_, i) => ({
        date: rangeStart.clone().add(i, 'days').format('MMM D'),
        balance: null,
      }))
      const opening = inRange.length > 0 ? inRange[0].balance : lastBalance
      if (slots.length > 0) slots[0].balance = opening
      for (const h of inRange) {
        const idx = Math.floor(moment(h.createdAt).tz(IST_TIMEZONE).diff(rangeStart, 'days', true))
        if (idx >= 0 && idx < slots.length) slots[idx].balance = h.balance
      }
      if (slots.length > 0) slots[slots.length - 1].balance = lastBalance
      let last: number | null = null
      for (const s of slots) {
        if (s.balance !== null) last = s.balance
        else if (last !== null) s.balance = last
      }
      points = slots
    } else {
      // 3 months
      rangeStart = now.clone().subtract(3, 'months').startOf('month')
      const inRange = graphHistory.filter((h) =>
        moment(h.createdAt).tz(IST_TIMEZONE).isSameOrAfter(rangeStart),
      )
      points = buildDailyPoints(inRange, currentBalance, rangeStart, now)
    }

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
  }, [history, currentBalance, filter])

  const color = isPositive ? '#10b981' : '#ef4444'

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filter === f.key
                ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

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
    </div>
  )
}
