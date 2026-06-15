import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const history = await prisma.balanceHistory.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Balance history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
