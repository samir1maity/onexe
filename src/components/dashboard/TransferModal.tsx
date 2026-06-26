'use client'

import { useState } from 'react'
import { X, BanknoteIcon, Users, Loader2, ArrowRight, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Props {
  walletBalance: number
  defaultType?: 'bank' | 'user'
  onClose: () => void
  onSuccess: () => void
}

export default function TransferModal({ walletBalance, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<'bank' | 'user'>('user')
  const [form, setForm] = useState({ receiverUserId: '', amount: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const maxTransferable = Math.max(0, walletBalance - 100)

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
        body: JSON.stringify({
          receiverUserId: form.receiverUserId,
          amount: amt,
          note: form.note,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Transfer failed'); return }
      setSuccess(`Transfer successful! Net amount: ${formatCurrency(data.netAmount)}${data.tax > 0 ? ` (Tax: ${formatCurrency(data.tax)})` : ''}`)
      setTimeout(onSuccess, 2000)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-card w-full max-w-md fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="font-semibold text-white">Transfer Funds</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Balance display */}
          <div className="flex items-center justify-between p-3 rounded-xl mb-5"
               style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <span className="text-sm text-gray-400">Available Balance</span>
            <span className="font-bold text-white">{formatCurrency(walletBalance)}</span>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-5"
               style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {([['bank', BanknoteIcon, 'To Bank'], ['user', Users, 'To User']] as const).map(([t, Icon, label]) => (
              <button
                key={t}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setTab(t as 'bank' | 'user')}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {tab === 'bank' ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-white font-medium mb-2">Bank Transfer Unavailable</h3>
              <p className="text-gray-400 text-sm">
                Bank transfers are temporarily disabled. Please contact support for more information.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Receiver User ID
                </label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="e.g. ONXE123456"
                  value={form.receiverUserId}
                  onChange={(e) => setForm({ ...form, receiverUserId: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-gray-500 mt-1">Enter the User ID of the recipient</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Amount (min ₹500)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input
                    type="number"
                    className="input-dark"
                    style={{ paddingLeft: '2rem' }}
                    placeholder="500"
                    min={500}
                    max={maxTransferable}
                    step="0.001"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
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
                <input
                  type="text"
                  className="input-dark"
                  placeholder="Add a note..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>

              <button
                className="btn-primary flex items-center justify-center gap-2"
                onClick={handleTransfer}
                disabled={loading || !!success}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 spinner" /> Processing...</>
                ) : (
                  <>Transfer <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
