import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { receiverUserId, amount, note } = await req.json()

    if (!receiverUserId || !amount) {
      return NextResponse.json({ error: 'Receiver ID and amount are required' }, { status: 400 })
    }

    const transferAmount = parseFloat(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (transferAmount < 500) {
      return NextResponse.json({ error: 'Minimum transfer amount is ₹500' }, { status: 400 })
    }

    const sender = await prisma.user.findUnique({ where: { id: auth.id } })
    if (!sender) return NextResponse.json({ error: 'Sender not found' }, { status: 404 })

    const maxTransferable = sender.walletBalance - 100
    if (maxTransferable <= 0) {
      return NextResponse.json({ error: 'Insufficient balance — minimum ₹100 must remain in wallet' }, { status: 400 })
    }
    if (transferAmount > maxTransferable) {
      return NextResponse.json({ error: `Maximum transferable amount is ${formatCurrency(maxTransferable)} (₹100 must remain in wallet)` }, { status: 400 })
    }

    const receiver = await prisma.user.findUnique({ where: { userId: receiverUserId } })
    if (!receiver) return NextResponse.json({ error: 'Receiver not found with that User ID' }, { status: 404 })

    if (receiver.id === sender.id) {
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 })
    }

    const settings = await prisma.globalSettings.findFirst()
    let tax = 0
    if (settings?.taxEnabled && settings.taxPercentage > 0) {
      tax = (transferAmount * settings.taxPercentage) / 100
    }
    const netAmount = transferAmount - tax

    await prisma.$transaction([
      prisma.user.update({
        where: { id: sender.id },
        data: { walletBalance: { decrement: transferAmount } },
      }),
      prisma.user.update({
        where: { id: receiver.id },
        data: { walletBalance: { increment: netAmount } },
      }),
      prisma.transfer.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          amount: transferAmount,
          tax,
          netAmount,
          note: note || null,
        },
      }),
      prisma.balanceHistory.create({
        data: {
          userId: sender.id,
          balance: sender.walletBalance - transferAmount,
          type: 'transfer_out',
          note: `Transfer to ${receiver.userId}`,
        },
      }),
      prisma.balanceHistory.create({
        data: {
          userId: receiver.id,
          balance: receiver.walletBalance + netAmount,
          type: 'transfer_in',
          note: `Transfer from ${sender.userId}`,
        },
      }),
    ])

    return NextResponse.json({ message: 'Transfer successful', tax, netAmount })
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const transfers = await prisma.transfer.findMany({
      where: {
        OR: [{ senderId: auth.id }, { receiverId: auth.id }],
      },
      include: {
        sender: { select: { userId: true, name: true } },
        receiver: { select: { userId: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ transfers })
  } catch (error) {
    console.error('Get transfers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
