'use client'

import { useState, useMemo } from 'react'
import { Search, CheckCircle2, XCircle, Eye, Loader2, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface UserItem {
  id: string
  userId: string
  name: string
  email: string
  phone?: string | null
  status: string
  walletBalance: number
  graphBalance: number
  referralCode: string
  createdAt: string
}

interface Props { users: UserItem[] }

export default function AdminUsersClient({ users: initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [sortField, setSortField] = useState<'name' | 'createdAt' | 'walletBalance'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const filtered = useMemo(() => {
    let result = users
    if (statusFilter !== 'all') result = result.filter((u) => u.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((u) =>
        u.userId.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    }
    result = [...result].sort((a, b) => {
      let valA: string | number = a[sortField]
      let valB: string | number = b[sortField]
      if (sortField === 'createdAt') { valA = new Date(valA).getTime(); valB = new Date(valB).getTime() }
      if (sortDir === 'asc') return valA > valB ? 1 : -1
      return valA < valB ? 1 : -1
    })
    return result
  }, [users, search, statusFilter, sortField, sortDir])

  const updateStatus = async (userId: string, status: string) => {
    setLoading(userId)
    setMsg(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: data.error || 'Failed' }); return }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status } : u))
      if (selectedUser?.id === userId) setSelectedUser((u) => u ? { ...u, status } : null)
      setMsg({ type: 'success', text: `User ${status} successfully` })
    } catch {
      setMsg({ type: 'error', text: 'Network error' })
    } finally {
      setLoading(null)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  const counts = {
    all: users.length,
    pending: users.filter((u) => u.status === 'pending').length,
    approved: users.filter((u) => u.status === 'approved').length,
    rejected: users.filter((u) => u.status === 'rejected').length,
  }

  const SortBtn = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button
      className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
      onClick={() => { if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDir('desc') } }}
    >
      {label}
      {sortField === field
        ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        : <ChevronDown className="w-3 h-3 opacity-40" />}
    </button>
  )

  return (
    <div className="space-y-5 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 text-sm mt-0.5">{users.length} total users</p>
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              className="input-dark pl-9 text-sm"
              placeholder="Search by User ID, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
              <button
                key={s}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s
                    ? s === 'pending' ? 'badge-pending' : s === 'approved' ? 'badge-approved' : s === 'rejected' ? 'badge-rejected' : 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                }`}
                onClick={() => setStatusFilter(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Table */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-xs font-medium text-gray-500">
                    <SortBtn field="name" label="User" />
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500">
                    <SortBtn field="walletBalance" label="Balance" />
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No users found</p>
                    </td>
                  </tr>
                ) : filtered.map((u) => (
                  <tr key={u.id}
                    className={`border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors ${selectedUser?.id === u.id ? 'bg-blue-500/5' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{u.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.status === 'approved' ? 'badge-approved' :
                        u.status === 'pending' ? 'badge-pending' : 'badge-rejected'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-white text-sm">{formatCurrency(u.walletBalance)}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedUser(u)}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {u.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(u.id, 'approved')} disabled={!!loading}
                              className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors disabled:opacity-50">
                              {loading === u.id ? <Loader2 className="w-3.5 h-3.5 spinner" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => updateStatus(u.id, 'rejected')} disabled={!!loading}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {u.status === 'rejected' && (
                          <button onClick={() => updateStatus(u.id, 'approved')} disabled={!!loading}
                            className="px-2 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs transition-colors">
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Panel */}
        <div className="glass-card p-5">
          {selectedUser ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white">User Details</h3>
                <button onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-white p-1 rounded transition-colors text-xs">✕</button>
              </div>

              <div className="flex flex-col items-center p-4 rounded-xl bg-white/3 border border-white/5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/40 to-violet-500/40 flex items-center justify-center text-2xl font-bold text-white mb-2">
                  {selectedUser.name.charAt(0)}
                </div>
                <p className="text-white font-semibold">{selectedUser.name}</p>
                <p className="text-xs text-gray-400 font-mono">{selectedUser.userId}</p>
                <span className={`mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                  selectedUser.status === 'approved' ? 'badge-approved' :
                  selectedUser.status === 'pending' ? 'badge-pending' : 'badge-rejected'
                }`}>
                  {selectedUser.status}
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                {[
                  { label: 'Email', value: selectedUser.email },
                  { label: 'Phone', value: selectedUser.phone || 'N/A' },
                  { label: 'Referral Code', value: selectedUser.referralCode },
                  { label: 'Wallet Balance', value: formatCurrency(selectedUser.walletBalance) },
                  { label: 'Graph Balance', value: formatCurrency(selectedUser.graphBalance) },
                  { label: 'Joined', value: formatDate(selectedUser.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start">
                    <span className="text-gray-400 text-xs">{label}</span>
                    <span className="text-white text-xs font-medium text-right max-w-[55%] break-all">{value}</span>
                  </div>
                ))}
              </div>

              {selectedUser.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(selectedUser.id, 'approved')} disabled={!!loading}
                    className="flex-1 py-2 rounded-lg bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 text-sm font-medium transition-all flex items-center justify-center gap-1">
                    {loading === selectedUser.id ? <Loader2 className="w-4 h-4 spinner" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve
                  </button>
                  <button onClick={() => updateStatus(selectedUser.id, 'rejected')} disabled={!!loading}
                    className="flex-1 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-sm font-medium transition-all flex items-center justify-center gap-1">
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
              {selectedUser.status === 'rejected' && (
                <button onClick={() => updateStatus(selectedUser.id, 'approved')} disabled={!!loading}
                  className="w-full py-2 rounded-lg bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 text-sm font-medium transition-all">
                  Approve User
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Eye className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">Select a user to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
