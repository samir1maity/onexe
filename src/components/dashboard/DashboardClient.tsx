'use client'

import { useState, useMemo } from 'react'
import { Users, TrendingUp, TrendingDown, Copy, CheckCheck, Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react'
import TradingGraph from './TradingGraph'
import TransferModal from './TransferModal'
import { formatCurrency, formatDate } from '@/lib/utils'

interface User {
  id: string
  userId: string
  name: string
  email: string
  phone?: string | null
  role: string
  status: string
  walletBalance: number
  graphBalance: number
  referralCode: string
  referredBy?: string | null
  createdAt: string
}

interface BalanceHistoryItem {
  id: string
  balance: number
  type: string
  note?: string | null
  createdAt: string
}

interface Transfer {
  id: string
  amount: number
  tax: number
  netAmount: number
  note?: string | null
  createdAt: string
  sender: { userId: string; name: string }
  receiver: { userId: string; name: string }
}

interface Props {
  user: User
  balanceHistory: BalanceHistoryItem[]
  transfers: Transfer[]
  referrals: { userId: string; name: string; createdAt: string }[]
  referrer: { userId: string; name: string } | null
  teamNumber: number
}

export default function DashboardClient({ user, balanceHistory, transfers, referrals, teamNumber }: Props) {
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const [copied, setCopied] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferType, setTransferType] = useState<'bank' | 'user'>('user')

  const copyReferral = () => {
    navigator.clipboard.writeText(user.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/register?ref=${user.referralCode}`
    : ''

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, <span className="gradient-text">{user.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Your portfolio overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
            ● Active
          </span>
          <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400 font-mono">
            {user.userId}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Wallet Balance */}
        <button
          onClick={() => setShowTransferModal(true)}
          className="glass-card p-5 text-left hover:border-blue-500/40 transition-all group cursor-pointer"
          style={{ border: '1px solid rgba(30,45,61,0.6)' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">Click to transfer</span>
          </div>
          <p className="text-xs text-gray-400 mb-1">Wallet Balance</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(user.walletBalance)}</p>
          <p className="text-xs text-gray-500 mt-1">Available for transfer</p>
        </button>

        {/* Portfolio Value */}
        <div className="glass-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-1">Portfolio Value</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(user.graphBalance)}</p>
          <p className="text-xs text-gray-500 mt-1">Trading graph value</p>
        </div>

        {/* Team */}
        <div className="glass-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-1">Team Members</p>
          <p className="text-2xl font-bold text-white">{teamNumber}</p>
          <p className="text-xs text-gray-500 mt-1">Active referrals</p>
        </div>
      </div>

      {/* Trading Graph */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-white">Trading Graph</h2>
            <p className="text-xs text-gray-400 mt-0.5">Portfolio performance over time</p>
          </div>
          <div className="flex items-center gap-1.5">
            {user.graphBalance >= 0 ? (
              <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" /> Portfolio
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                <TrendingDown className="w-3 h-3" /> Portfolio
              </div>
            )}
          </div>
        </div>
        <TradingGraph history={balanceHistory} currentBalance={user.graphBalance} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Transactions</h2>
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </div>

          {transfers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <ArrowUpRight className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">No transactions yet</p>
              <p className="text-gray-600 text-xs mt-1">Your transfers will appear here</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {transfers.map((t) => {
                const isSender = t.sender.userId === user.userId
                return (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSender ? 'bg-red-500/15' : 'bg-green-500/15'}`}>
                      {isSender
                        ? <ArrowUpRight className="w-4 h-4 text-red-400" />
                        : <ArrowDownLeft className="w-4 h-4 text-green-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {isSender ? `To ${t.receiver.name}` : `From ${t.sender.name}`}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(t.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold ${isSender ? 'text-red-400' : 'text-green-400'}`}>
                        {isSender ? '-' : '+'}{formatCurrency(isSender ? t.amount : t.netAmount)}
                      </p>
                      {t.tax > 0 && isSender && (
                        <p className="text-xs text-gray-600">Tax: {formatCurrency(t.tax)}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Referral Card */}
        <div className="glass-card p-5">
          <h2 className="font-semibold text-white mb-4">Referral Program</h2>
          <div className="rounded-xl p-4 mb-4"
               style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.2)' }}>
            <p className="text-xs text-gray-400 mb-1">Your Referral Code</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono font-bold text-white tracking-wider">{user.referralCode}</span>
              <button onClick={copyReferral}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white">
                {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-1.5">Referral Link</p>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/3 border border-white/10">
              <span className="text-xs text-gray-400 truncate flex-1 font-mono">{`/register?ref=${user.referralCode}`}</span>
              <button onClick={copyLink}
                className="p-1.5 rounded-md bg-blue-500/15 hover:bg-blue-500/25 transition-colors text-blue-400 flex-shrink-0">
                {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2">Referred Members ({referrals.length})</p>
            {referrals.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">No referrals yet. Share your code!</p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {referrals.map((r) => (
                  <div key={r.userId} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/3">
                    <div>
                      <p className="text-xs text-white">{r.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{r.userId}</p>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(r.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <TransferModal
          walletBalance={user.walletBalance}
          defaultType={transferType}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => {
            setShowTransferModal(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
