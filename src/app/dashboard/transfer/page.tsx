import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import TransferPageClient from '@/components/dashboard/TransferPageClient'

export default async function TransferPage() {
  const auth = await getAuthUser()
  if (!auth) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { walletBalance: true, userId: true, name: true },
  })
  if (!user) redirect('/login')

  const transfers = await prisma.transfer.findMany({
    where: { OR: [{ senderId: auth.id }, { receiverId: auth.id }] },
    include: {
      sender: { select: { userId: true, name: true } },
      receiver: { select: { userId: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <TransferPageClient
      user={user}
      transfers={JSON.parse(JSON.stringify(transfers))}
    />
  )
}
