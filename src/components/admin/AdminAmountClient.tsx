'use client'

import { useState, useMemo } from 'react'
import { User, Users, IndianRupee, Loader2, CheckCircle2, AlertCircle, Plus, Minus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface UserItem {
  id: string
  userId: string
  name: string
  email: string
  phone?: string | null
  walletBalance: number
  graphBalance: number
  createdAt: string
}

interface Props { users: UserItem[] }

const PAGE_SIZE = 10

export default function AdminAmountClient({ users }: Props) {
  const [tab, setTab] = useState<'single' | 'all'>('all')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [isDeduct, setIsDeduct] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [singleSearch, setSingleSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

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
        : { type: 'all', amount: finalAmt }

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      u.name.toLowerCase().includes(q) || u.userId.toLowerCase().includes(q)
    )
  }, [users, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSearch = (q: string) => { setSearch(q); setPage(1) }

  const singleFiltered = useMemo(() => {
    const q = singleSearch.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      u.userId.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    )
  }, [users, singleSearch])

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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    className="input-dark pl-9 text-sm"
                    placeholder="Search by user ID, email or phone..."
                    value={singleSearch}
                    onChange={(e) => { setSingleSearch(e.target.value); setShowDropdown(true); setSelectedUserId('') }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  />
                  {showDropdown && (
                    <div className="absolute z-20 w-full mt-1 rounded-xl border border-white/10 overflow-hidden shadow-xl"
                      style={{ background: '#0f1623' }}>
                      {singleFiltered.length === 0 ? (
                        <p className="px-3 py-2.5 text-xs text-gray-500">No users found</p>
                      ) : singleFiltered.slice(0, 8).map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center justify-between gap-2 ${selectedUserId === u.id ? 'bg-blue-500/10' : ''}`}
                          onMouseDown={() => {
                            setSelectedUserId(u.id)
                            setSingleSearch(`${u.name} (${u.userId})`)
                            setShowDropdown(false)
                          }}
                        >
                          <div>
                            <p className="text-white font-medium">{u.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{u.userId}</p>
                            <p className="text-xs text-gray-600">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">{formatCurrency(u.walletBalance)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedUser && (
                  <div className="mt-2 p-2.5 rounded-lg bg-white/3 border border-white/5 text-xs">
                    <p className="text-white font-medium">{selectedUser.name}</p>
                    <p className="text-gray-400">Wallet: {formatCurrency(selectedUser.walletBalance)}</p>
                    <p className="text-amber-400/70 mt-0.5">⚠ Individual updates do not affect the trading graph</p>
                  </div>
                )}
              </div>
            )}

            {tab === 'all' && (
              <p className="text-xs text-gray-500">This will apply to all {users.length} active users</p>
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
                : <><IndianRupee className="w-4 h-4" />{isDeduct ? 'Deduct' : 'Add'} Amount</>
              }
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-3 glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Active Users ({users.length})</h2>
              <span className="text-xs text-gray-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                className="input-dark pl-9 text-sm py-2"
                placeholder="Search by name or user ID..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
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
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-400 text-sm">
                      {search ? 'No users match your search' : 'No active users'}
                    </td>
                  </tr>
                ) : paginated.map((u) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-gray-600 text-xs">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                          currentPage === p ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => setPage(p as number)}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
