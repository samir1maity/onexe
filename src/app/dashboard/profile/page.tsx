import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { User, Mail, Phone, Calendar, Hash, Share2, ShieldCheck } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function ProfilePage() {
  const auth = await getAuthUser()
  if (!auth) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      walletBalance: true,
      graphBalance: true,
      referralCode: true,
      referredBy: true,
      createdAt: true,
    },
  })

  if (!user) redirect('/login')

  const referrer = user.referredBy
    ? await prisma.user.findUnique({ where: { id: user.referredBy }, select: { userId: true, name: true } })
    : null

  const teamCount = await prisma.user.count({ where: { referredBy: auth.id, status: 'approved' } })

  const fields = [
    { icon: User, label: 'Full Name', value: user.name },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone || 'Not provided' },
    { icon: Hash, label: 'User ID', value: user.userId },
    { icon: Calendar, label: 'Member Since', value: formatDate(user.createdAt) },
    { icon: Share2, label: 'Referral Code', value: user.referralCode },
    { icon: User, label: 'Referred By', value: referrer ? `${referrer.name} (${referrer.userId})` : 'Direct Registration' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-gray-400 text-sm mt-0.5">Your account information</p>
      </div>

      {/* Profile Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 text-3xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium badge-approved">
                <ShieldCheck className="inline w-3 h-3 mr-1" />Active
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono">
                {user.userId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-1">Wallet Balance</p>
          <p className="text-xl font-bold text-white">{formatCurrency(user.walletBalance)}</p>
          <p className="text-xs text-gray-500 mt-1">Available funds</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-1">Portfolio Value</p>
          <p className="text-xl font-bold text-white">{formatCurrency(user.graphBalance)}</p>
          <p className="text-xs text-gray-500 mt-1">Graph balance</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-1">Team Size</p>
          <p className="text-xl font-bold text-white">{teamCount}</p>
          <p className="text-xs text-gray-500 mt-1">Active referrals</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-1">Role</p>
          <p className="text-xl font-bold text-white capitalize">{user.role}</p>
          <p className="text-xs text-gray-500 mt-1">Account type</p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4">Account Details</h3>
        <div className="space-y-3">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm text-white font-medium truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
