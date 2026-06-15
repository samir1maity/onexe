'use client'

import { useState } from 'react'
import { User, Users, Calendar, DollarSign, Loader2, CheckCircle2, AlertCircle, Plus, Minus } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface UserItem {
  id: string
  userId: string
  name: string
  walletBalance: number
  graphBalance: number
  createdAt: string
}

interface Props { users: UserItem[] }

export default function AdminAmountClient({ users }: Props) {
  const [tab, setTab] = useState<'single' | 'all'>('all')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [isDeduct, setIsDeduct] = useState(false)
  const [date, setDate] = useState('')
  const [dateCount, setDateCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingDate, setCheckingDate] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleDateChange = async (d: string) => {
    setDate(d)
    if (!d) { setDateCount(null); return }
    setCheckingDate(true)
    try {
      const res = await fetch(`/api/admin/amount?date=${d}`)
      const data = await res.json()
      setDateCount(data.count)
    } finally {
      setCheckingDate(false)
    }
  }

  const handleSubmit = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setMsg({ type: 'error', text: 'Enter a valid positive amount' }); return }
    if (tab === 'single' && !selectedUserId) { setMsg({ type: 'error', text: 'Select a user' }); return }

    setLoading(true)
    setMsg(null)
    try {
      const finalAmt = isDeduct ? -Math.abs(amt) : Math.abs(amt)
      const body = tab === 'single'
        ? { type: 'single', userId: selectedUserId, amount: finalAmt }
        : { type: 'all', amount: finalAmt, date: date || undefined }

      const res = await fetch('/api/admin/amount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: data.error || 'Failed' }); return }
      setMsg({ type: 'success', text: data.message })
      setAmount('')
      setTimeout(() => { setMsg(null); window.location.reload() }, 2500)
    } catch {
      setMsg({ type: 'error', text: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  const selectedUser = users.find((u) => u.id === selectedUserId)

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Amount Management</h1>
        <p className="text-gray-400 text-sm mt-0.5">Add or deduct balance from users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab */}
          <div className="glass-card p-1.5 flex gap-1.5">
            {([['all', Users, 'All Users'], ['single', User, 'Single User']] as const).map(([t, Icon, label]) => (
              <button key={t}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === t ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-white border border-blue-500/30' : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => setTab(t as 'single' | 'all')}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="glass-card p-5 space-y-4">
            {msg && (
              <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                msg.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                {msg.text}
              </div>
            )}

            {tab === 'single' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Select User</label>
                <select
                  className="input-dark text-sm"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Choose a user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id} style={{ background: '#111827' }}>
                      {u.name} ({u.userId}) — {formatCurrency(u.walletBalance)}
                    </option>
                  ))}
                </select>
                {selectedUser && (
                  <div className="mt-2 p-2.5 rounded-lg bg-white/3 border border-white/5 text-xs">
                    <p className="text-white font-medium">{selectedUser.name}</p>
                    <p className="text-gray-400">Wallet: {formatCurrency(selectedUser.walletBalance)}</p>
                    <p className="text-xs text-gray-500 text-amber-400/70 mt-0.5">⚠ Individual updates do not affect the trading graph</p>
                  </div>
                )}
              </div>
            )}

            {tab === 'all' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Filter by Join Date (optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="date" className="input-dark pl-9 text-sm"
                    value={date} onChange={(e) => handleDateChange(e.target.value)} />
                </div>
                {checkingDate && <p className="text-xs text-gray-500 mt-1">Checking...</p>}
                {!checkingDate && date && (
                  <p className="text-xs mt-1">
                    {dateCount === 0
                      ? <span className="text-yellow-400">No users joined on this date</span>
                      : <span className="text-green-400">{dateCount} user{dateCount !== 1 ? 's' : ''} joined on this date</span>
                    }
                  </p>
                )}
                {!date && (
                  <p className="text-xs text-gray-500 mt-1">Leave empty to update all {users.length} active users</p>
                )}
                <p className="text-xs text-green-400/70 mt-2">✓ Global updates will move the trading graph</p>
              </div>
            )}

            {/* Add / Deduct Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Operation</label>
              <div className="flex gap-2">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
                    !isDeduct ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-white/5 border border-white/10 text-gray-400'
                  }`}
                  onClick={() => setIsDeduct(false)}>
                  <Plus className="w-4 h-4" /> Add
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
                    isDeduct ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-white/5 border border-white/10 text-gray-400'
                  }`}
                  onClick={() => setIsDeduct(true)}>
                  <Minus className="w-4 h-4" /> Deduct
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input type="number" className="input-dark pl-7" placeholder="0.001"
                  min="0.001" step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)} />
              </div>
              <p className="text-xs text-gray-500 mt-1">Supports decimal values (e.g., ₹0.001, ₹0.5)</p>
            </div>

            <button className="btn-primary flex items-center justify-center gap-2"
              onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><Loader2 className="w-4 h-4 spinner" /> Processing...</>
                : <><DollarSign className="w-4 h-4" />{isDeduct ? 'Deduct' : 'Add'} Amount</>
              }
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-3 glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Active Users ({users.length})</h2>
            <p className="text-xs text-gray-500 mt-0.5">All approved users and their balances</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Wallet</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Graph</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-400 text-sm">No active users</td>
                  </tr>
                ) : users.map((u) => (
                  <tr key={u.id}
                    className={`border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors cursor-pointer ${tab === 'single' && selectedUserId === u.id ? 'bg-blue-500/5' : ''}`}
                    onClick={() => { if (tab === 'single') setSelectedUserId(u.id) }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm">{u.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{u.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white text-sm">{formatCurrency(u.walletBalance)}</td>
                    <td className="px-4 py-3 text-white text-sm">{formatCurrency(u.graphBalance)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
