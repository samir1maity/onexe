import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
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

  const balanceHistory = await prisma.balanceHistory.findMany({
    where: { userId: auth.id },
    orderBy: { createdAt: 'asc' },
    take: 100,
  })

  const transfers = await prisma.transfer.findMany({
    where: { OR: [{ senderId: auth.id }, { receiverId: auth.id }] },
    include: {
      sender: { select: { userId: true, name: true } },
      receiver: { select: { userId: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const referrals = await prisma.user.findMany({
    where: { referredBy: auth.id, status: 'approved' },
    select: { userId: true, name: true, createdAt: true },
  })

  const referrer = user.referredBy
    ? await prisma.user.findUnique({
        where: { id: user.referredBy },
        select: { userId: true, name: true },
      })
    : null

  const teamNumber = await prisma.user.count({
    where: { referredBy: auth.id, status: 'approved' },
  })

  return (
    <DashboardClient
      user={JSON.parse(JSON.stringify(user))}
      balanceHistory={JSON.parse(JSON.stringify(balanceHistory))}
      transfers={JSON.parse(JSON.stringify(transfers))}
      referrals={JSON.parse(JSON.stringify(referrals))}
      referrer={referrer ? JSON.parse(JSON.stringify(referrer)) : null}
      teamNumber={teamNumber}
    />
  )
}
