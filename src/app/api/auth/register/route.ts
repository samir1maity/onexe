import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateUserId, generateReferralCode } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, password, referralCode } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    let referrer = null
    if (referralCode) {
      referrer = await prisma.user.findUnique({ where: { referralCode } })
      if (!referrer) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
      }
    }

    const settings = await prisma.globalSettings.findFirst()
    const registrationBonus = settings?.registrationBonus ?? 100

    let userId = generateUserId()
    while (await prisma.user.findUnique({ where: { userId } })) {
      userId = generateUserId()
    }

    let newReferralCode = generateReferralCode()
    while (await prisma.user.findUnique({ where: { referralCode: newReferralCode } })) {
      newReferralCode = generateReferralCode()
    }

    const hashed = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        userId,
        name,
        email,
        phone: phone || null,
        password: hashed,
        referralCode: newReferralCode,
        referredBy: referrer?.id || null,
        status: 'pending',
        walletBalance: 0,
        graphBalance: 0,
      },
    })

    return NextResponse.json({
      message: 'Registration successful. Awaiting admin approval.',
      userId: user.userId,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
