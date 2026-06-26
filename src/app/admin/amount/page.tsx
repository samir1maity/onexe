import { prisma } from '@/lib/prisma'
import AdminAmountClient from '@/components/admin/AdminAmountClient'

export default async function AdminAmountPage() {
  const users = await prisma.user.findMany({
    where: { role: 'user', status: 'approved' },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      phone: true,
      walletBalance: true,
      graphBalance: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return <AdminAmountClient users={JSON.parse(JSON.stringify(users))} />
}
