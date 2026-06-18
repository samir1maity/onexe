'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { Suspense } from 'react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    const ref = searchParams.get('ref') || searchParams.get('referral')
    if (ref) setForm((f) => ({ ...f, referralCode: ref }))
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) { setError('Please accept Terms & Conditions'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          referralCode: form.referralCode,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      setSuccess(`Registration successful! Your User ID is: ${data.userId}. Awaiting admin approval.`)
      setTimeout(() => router.push('/login'), 5000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md fade-in">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Registration Successful!</h2>
          <p className="text-gray-300 text-sm mb-4">{success}</p>
          <p className="text-gray-500 text-xs">Redirecting to login in 5 seconds...</p>
          <Link href="/login" className="block mt-4 text-blue-400 hover:text-blue-300 text-sm">
            Go to Login →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md fade-in">
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <Image src="/ONEXE-logo.png" alt="Onexe" width={180} height={60} className="object-contain" />
        <p className="text-gray-400 text-xs mt-2">Create your trading account</p>
      </div>

      <div className="glass-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white mb-1">Create Account</h2>
        <p className="text-gray-400 text-sm mb-5">Join Onexe today</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Full Name *</label>
              <input
                type="text"
                className="input-dark text-sm"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                className="input-dark text-sm"
                placeholder="+91 9999999999"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email Address *</label>
            <input
              type="email"
              className="input-dark text-sm"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-dark text-sm pr-9"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Confirm Password *</label>
              <input
                type="password"
                className="input-dark text-sm"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Referral Code (optional)</label>
            <input
              type="text"
              className="input-dark text-sm"
              placeholder="Enter referral code"
              value={form.referralCode}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer group mt-1">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                className="sr-only"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${agreed ? 'bg-blue-500 border-blue-500' : 'border-gray-600 group-hover:border-gray-400'}`}>
                {agreed && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400">
              I accept the{' '}
              <span className="text-blue-400">Terms & Conditions</span>{' '}
              and{' '}
              <span className="text-blue-400">Privacy Policy</span>
            </span>
          </label>

          <button type="submit" className="btn-primary mt-1" disabled={loading || !agreed}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 spinner" /> Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-gray-600 mt-5">
        © {new Date().getFullYear()} Onexe. All rights reserved.
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 grid-pattern">
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
