import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let settings = await prisma.globalSettings.findFirst()
    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: { taxEnabled: false, taxPercentage: 0, referralReward: 0, registrationBonus: 100 },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthUser()
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    let settings = await prisma.globalSettings.findFirst()
    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: { taxEnabled: false, taxPercentage: 0, referralReward: 0, registrationBonus: 100 },
      })
    }

    const updated = await prisma.globalSettings.update({
      where: { id: settings.id },
      data: {
        taxEnabled: body.taxEnabled !== undefined ? body.taxEnabled : settings.taxEnabled,
        taxPercentage: body.taxPercentage !== undefined ? parseFloat(body.taxPercentage) : settings.taxPercentage,
        referralReward: body.referralReward !== undefined ? parseFloat(body.referralReward) : settings.referralReward,
        registrationBonus: body.registrationBonus !== undefined ? parseFloat(body.registrationBonus) : settings.registrationBonus,
      },
    })

    return NextResponse.json({ settings: updated })
  } catch (error) {
    console.error('Settings PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
