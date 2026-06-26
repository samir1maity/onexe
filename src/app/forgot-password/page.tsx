'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Step = 'email' | 'otp' | 'password' | 'done'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const startCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(interval); return 0 }
        return s - 1
      })
    }, 1000)
  }

  const handleSendOtp = async () => {
    setError('')
    if (!email) { setError('Enter your email address'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); return }
      setStep('otp')
      startCooldown()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid OTP'); return }
      setStep('password')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to reset password'); return }
      setStep('done')
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stepIndex = { email: 0, otp: 1, password: 2, done: 3 }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 grid-pattern">
      <div className="w-full max-w-md fade-in">
        <div className="flex flex-col items-center mb-6">
          <Image src="/ONEXE-logo.png" alt="Onexe" width={160} height={54} className="object-contain" />
        </div>

        {step !== 'done' && (
          <div className="glass-card p-6 sm:p-8">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-6">
              {['Email', 'OTP', 'Password'].map((label, i) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    stepIndex[step] > i ? 'bg-blue-500 text-white' :
                    stepIndex[step] === i ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' :
                    'bg-white/5 border border-white/10 text-gray-600'
                  }`}>
                    {stepIndex[step] > i ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs ${stepIndex[step] === i ? 'text-white' : 'text-gray-600'}`}>{label}</span>
                  {i < 2 && <div className={`flex-1 h-px ${stepIndex[step] > i ? 'bg-blue-500/50' : 'bg-white/5'}`} />}
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Step 1 — Email */}
            {step === 'email' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Forgot Password</h2>
                  <p className="text-gray-400 text-sm mt-0.5">Enter your registered email to receive an OTP</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      className="input-dark"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    />
                  </div>
                </div>
                <button className="btn-primary flex items-center justify-center gap-2" onClick={handleSendOtp} disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 spinner" /> Sending OTP...</> : 'Send OTP'}
                </button>
                <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            )}

            {/* Step 2 — OTP */}
            {step === 'otp' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Enter OTP</h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">One-Time Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      className="input-dark tracking-[0.4em] text-center font-mono text-lg"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">OTP expires in 10 minutes</p>
                </div>
                <button className="btn-primary flex items-center justify-center gap-2" onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 spinner" /> Verifying...</> : 'Verify OTP'}
                </button>
                <div className="flex items-center justify-between text-sm">
                  <button onClick={() => { setStep('email'); setOtp(''); setError('') }}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                    <ArrowLeft className="w-3.5 h-3.5" /> Change email
                  </button>
                  <button
                    onClick={() => { handleSendOtp(); setOtp('') }}
                    disabled={resendCooldown > 0 || loading}
                    className="text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors">
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — New Password */}
            {step === 'password' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Set New Password</h2>
                  <p className="text-gray-400 text-sm mt-0.5">Choose a strong password for your account</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-dark pr-9"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    className="input-dark"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                  />
                </div>
                <button className="btn-primary flex items-center justify-center gap-2" onClick={handleResetPassword} disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 spinner" /> Resetting...</> : 'Reset Password'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Password Reset!</h2>
            <p className="text-gray-300 text-sm mb-1">Your password has been updated successfully.</p>
            <p className="text-gray-500 text-xs">Redirecting to login in 3 seconds...</p>
            <Link href="/login" className="inline-block mt-4 text-blue-400 hover:text-blue-300 text-sm">
              Go to Login →
            </Link>
          </div>
        )}

        <p className="text-center text-xs text-gray-600 mt-5">
          © {new Date().getFullYear()} Onexe. All rights reserved.
        </p>
      </div>
    </div>
  )
}
