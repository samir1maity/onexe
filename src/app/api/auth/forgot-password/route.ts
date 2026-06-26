import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOtpEmail } from '@/lib/mailer'

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    // Always return success to prevent user enumeration
    if (!user) return NextResponse.json({ message: 'If that email exists, an OTP has been sent.' })

    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Invalidate any existing unused OTPs for this email
    await prisma.otpToken.updateMany({
      where: { email: email.toLowerCase(), used: false },
      data: { used: true },
    })

    await prisma.otpToken.create({
      data: { email: email.toLowerCase(), otp, expiresAt },
    })

    await sendOtpEmail(email, otp)

    return NextResponse.json({ message: 'If that email exists, an OTP has been sent.' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 })
  }
}
