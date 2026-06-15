import { prisma } from '@/lib/prisma'
import AdminUsersClient from '@/components/admin/AdminUsersClient'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: 'user' },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      walletBalance: true,
      graphBalance: true,
      referralCode: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <AdminUsersClient users={JSON.parse(JSON.stringify(users))} />
  )
}
