import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { type, userId, amount, date } = await req.json()

    const amountVal = parseFloat(amount)
    if (isNaN(amountVal)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (type === 'single') {
      if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      const newBalance = user.walletBalance + amountVal
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { walletBalance: { increment: amountVal } },
        }),
        prisma.balanceHistory.create({
          data: {
            userId,
            balance: newBalance,
            type: amountVal >= 0 ? 'admin_credit' : 'admin_debit',
            note: `Admin ${amountVal >= 0 ? 'added' : 'deducted'} ₹${Math.abs(amountVal)}`,
          },
        }),
      ])

      return NextResponse.json({ message: 'Balance updated for user' })
    }

    if (type === 'all') {
      let users
      if (date) {
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)
        users = await prisma.user.findMany({
          where: { role: 'user', status: 'approved', createdAt: { gte: start, lte: end } },
        })
      } else {
        users = await prisma.user.findMany({ where: { role: 'user', status: 'approved' } })
      }

      await prisma.$transaction(
        users.flatMap((user) => [
          prisma.user.update({
            where: { id: user.id },
            data: {
              graphBalance: { increment: amountVal },
              walletBalance: { increment: amountVal },
            },
          }),
          prisma.balanceHistory.create({
            data: {
              userId: user.id,
              balance: user.graphBalance + amountVal,
              type: amountVal >= 0 ? 'graph_credit' : 'graph_debit',
              note: `Global ${amountVal >= 0 ? 'credit' : 'debit'} ₹${Math.abs(amountVal)}`,
            },
          }),
        ])
      )

      return NextResponse.json({
        message: `Balance updated for ${users.length} users`,
        count: users.length,
      })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Admin amount error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')

    if (!date) return NextResponse.json({ count: 0 })

    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    const count = await prisma.user.count({
      where: { role: 'user', status: 'approved', createdAt: { gte: start, lte: end } },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Admin amount GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
