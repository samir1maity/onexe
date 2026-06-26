'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle, CheckCircle2, BanknoteIcon, Users, ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

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
  user: { walletBalance: number; userId: string; name: string }
  transfers: Transfer[]
}

export default function TransferPageClient({ user, transfers }: Props) {
  const [tab, setTab] = useState<'bank' | 'user'>('user')
  const [form, setForm] = useState({ receiverUserId: '', amount: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const maxTransferable = Math.max(0, user.walletBalance - 100)

  const handleTransfer = async () => {
    setError('')
    const amt = parseFloat(form.amount)
    if (!form.receiverUserId) { setError('Enter receiver User ID'); return }
    if (!amt || amt < 500) { setError('Minimum transfer amount is ₹500'); return }
    if (amt > maxTransferable) { setError(`Maximum transferable amount is ${formatCurrency(maxTransferable)} (₹100 must remain in wallet)`); return }

    setLoading(true)
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverUserId: form.receiverUserId, amount: amt, note: form.note }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Transfer failed'); return }
      setSuccess(`Transfer successful! Net: ${formatCurrency(data.netAmount)}${data.tax > 0 ? ` | Tax: ${formatCurrency(data.tax)}` : ''}`)
      setForm({ receiverUserId: '', amount: '', note: '' })
      setTimeout(() => { setSuccess(''); window.location.reload() }, 3000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Transfer Funds</h1>
        <p className="text-gray-400 text-sm mt-0.5">Send money to other users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Transfer Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Balance */}
          <div className="glass-card p-4 flex items-center justify-between"
               style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
            <div>
              <p className="text-xs text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold text-white mt-0.5">{formatCurrency(user.walletBalance)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <BanknoteIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          <div className="glass-card p-5">
            {/* Tabs */}
            <div className="flex rounded-xl p-1 mb-5"
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {([['bank', BanknoteIcon, 'To Bank'], ['user', Users, 'To User']] as const).map(([t, Icon, label]) => (
                <button key={t}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setTab(t as 'bank' | 'user')}>
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {tab === 'bank' ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-white font-medium mb-2">Bank Transfer Unavailable</h3>
                <p className="text-gray-400 text-sm">Bank transfers are temporarily disabled. Please contact support.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Receiver User ID</label>
                  <input type="text" className="input-dark" placeholder="e.g. ONXE123456"
                    value={form.receiverUserId}
                    onChange={(e) => setForm({ ...form, receiverUserId: e.target.value.toUpperCase() })} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input type="number" className="input-dark" style={{ paddingLeft: '2rem' }} placeholder="500"
                      min={500} max={maxTransferable} step="0.001"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">Min: ₹500</span>
                    <div className="relative group flex items-center gap-1">
                      <button className="text-blue-400 hover:text-blue-300"
                        onClick={() => setForm({ ...form, amount: maxTransferable.toString() })}>
                        Max: {formatCurrency(maxTransferable)}
                      </button>
                      <span className="text-gray-600 cursor-help">ⓘ</span>
                      <div className="absolute bottom-full right-0 mb-2 w-52 hidden group-hover:block z-10">
                        <div className="glass-card px-3 py-2 text-xs text-gray-300 leading-relaxed">
                          ₹100 is reserved and cannot be transferred. Your max transferable amount is wallet balance minus ₹100.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Note (optional)</label>
                  <input type="text" className="input-dark" placeholder="Add a note..."
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>

                <button className="btn-primary flex items-center justify-center gap-2"
                  onClick={handleTransfer} disabled={loading || !!success}>
                  {loading
                    ? <><Loader2 className="w-4 h-4 spinner" /> Processing...</>
                    : <>Transfer <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transfer History */}
        <div className="lg:col-span-3 glass-card p-5">
          <h2 className="font-semibold text-white mb-4">Transfer History</h2>
          {transfers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <ArrowUpRight className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">No transfers yet</p>
              <p className="text-gray-600 text-xs mt-1">Start your first transfer</p>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
              {transfers.map((t) => {
                const isSender = t.sender.userId === user.userId
                return (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSender ? 'bg-red-500/15' : 'bg-green-500/15'}`}>
                      {isSender
                        ? <ArrowUpRight className="w-5 h-5 text-red-400" />
                        : <ArrowDownLeft className="w-5 h-5 text-green-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-white font-medium truncate">
                          {isSender ? `Sent to ${t.receiver.name}` : `Received from ${t.sender.name}`}
                        </p>
                        <p className={`text-sm font-bold flex-shrink-0 ml-2 ${isSender ? 'text-red-400' : 'text-green-400'}`}>
                          {isSender ? '-' : '+'}{formatCurrency(isSender ? t.amount : t.netAmount)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500">
                          {isSender ? t.receiver.userId : t.sender.userId}
                          {t.note ? ` • ${t.note}` : ''}
                        </p>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-xs text-gray-500">{formatDate(t.createdAt)}</p>
                          {t.tax > 0 && isSender && (
                            <p className="text-xs text-orange-400/70">Tax: {formatCurrency(t.tax)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
