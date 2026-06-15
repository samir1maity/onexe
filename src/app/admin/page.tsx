import { prisma } from '@/lib/prisma'
import { Users, UserCheck, UserX, Clock, TrendingUp, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminPage() {
  const [totalUsers, pendingUsers, approvedUsers, rejectedUsers, totalTransfers, settings] =
    await Promise.all([
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({ where: { role: 'user', status: 'pending' } }),
      prisma.user.count({ where: { role: 'user', status: 'approved' } }),
      prisma.user.count({ where: { role: 'user', status: 'rejected' } }),
      prisma.transfer.aggregate({ _sum: { amount: true }, _count: true }),
      prisma.globalSettings.findFirst(),
    ])

  const recentUsers = await prisma.user.findMany({
    where: { role: 'user' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { userId: true, name: true, status: true, createdAt: true, walletBalance: true },
  })

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'blue', sub: 'All registered' },
    { label: 'Pending Approval', value: pendingUsers, icon: Clock, color: 'yellow', sub: 'Awaiting review', href: '/admin/users?status=pending' },
    { label: 'Active Users', value: approvedUsers, icon: UserCheck, color: 'green', sub: 'Approved accounts' },
    { label: 'Rejected', value: rejectedUsers, icon: UserX, color: 'red', sub: 'Rejected accounts' },
    { label: 'Total Transfers', value: totalTransfers._count, icon: TrendingUp, color: 'violet', sub: 'All time' },
    { label: 'Transfer Volume', value: formatCurrency(totalTransfers._sum.amount || 0), icon: DollarSign, color: 'emerald', sub: 'All time', isText: true },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/15 text-blue-400',
    yellow: 'bg-yellow-500/15 text-yellow-400',
    green: 'bg-green-500/15 text-green-400',
    red: 'bg-red-500/15 text-red-400',
    violet: 'bg-violet-500/15 text-violet-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-gray-400 text-sm mt-0.5">Platform statistics and quick actions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, sub, href, isText }) => {
          const card = (
            <div className={`glass-card p-5 ${href ? 'hover:border-blue-500/30 transition-all cursor-pointer' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {href && pendingUsers > 0 && color === 'yellow' && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30 font-medium animate-pulse">
                    Action needed
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`font-bold text-white mt-1 ${isText ? 'text-lg' : 'text-2xl'}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            </div>
          )
          return href ? <Link href={href} key={label}>{card}</Link> : <div key={label}>{card}</div>
        })}
      </div>

      {/* Settings Summary */}
      {settings && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Platform Settings</h2>
            <Link href="/admin/settings"
              className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 transition-colors">
              Configure →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Tax', value: settings.taxEnabled ? `${settings.taxPercentage}%` : 'OFF', highlight: settings.taxEnabled },
              { label: 'Tax Rate', value: `${settings.taxPercentage}%` },
              { label: 'Referral Reward', value: formatCurrency(settings.referralReward) },
              { label: 'Reg. Bonus', value: formatCurrency(settings.registrationBonus) },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="p-3 rounded-xl bg-white/3 border border-white/5">
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-yellow-400' : 'text-white'}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Users */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Recent Registrations</h2>
          <Link href="/admin/users"
            className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 transition-colors">
            View all →
          </Link>
        </div>
        <div className="space-y-2">
          {recentUsers.map((u) => (
            <div key={u.userId} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center text-sm font-bold text-white">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-white">{u.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{u.userId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  u.status === 'approved' ? 'badge-approved' :
                  u.status === 'pending' ? 'badge-pending' : 'badge-rejected'
                }`}>
                  {u.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
