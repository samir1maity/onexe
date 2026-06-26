import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser()
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { status } = body

    if (!['approved', 'rejected', 'pending', 'inactive'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const settings = await prisma.globalSettings.findFirst()
    const registrationBonus = settings?.registrationBonus ?? 100
    const referralReward = settings?.referralReward ?? 0

    if (status === 'approved' && user.status !== 'approved') {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id },
          data: {
            status: 'approved',
            walletBalance: { increment: registrationBonus },
          },
        })

        await tx.balanceHistory.create({
          data: {
            userId: id,
            balance: user.walletBalance + registrationBonus,
            type: 'registration_bonus',
            note: 'Registration bonus',
          },
        })

        if (user.referredBy) {
          await tx.user.update({
            where: { id: user.referredBy },
            data: { walletBalance: { increment: referralReward } },
          })

          await tx.balanceHistory.create({
            data: {
              userId: user.referredBy,
              balance: 0,
              type: 'referral_reward',
              note: `Referral reward for ${user.userId}`,
            },
          })
        }
      })
    } else {
      await prisma.user.update({ where: { id }, data: { status } })
    }

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Admin user patch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
