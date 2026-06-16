'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Menu, X, LogOut, LayoutDashboard, ArrowLeftRight, User } from 'lucide-react'
import type { JWTPayload } from '@/lib/auth'

interface Props {
  user: JWTPayload
}

export default function DashboardNav({ user }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/transfer', label: 'Transfer', icon: ArrowLeftRight },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-white/5"
      style={{ background: 'rgba(10, 14, 26, 0.92)', backdropFilter: 'blur(10px)', willChange: 'backdrop-filter' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">Onexe</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
                 style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <span className="text-xs text-gray-400">ID:</span>
              <span className="text-xs font-mono font-semibold text-blue-400">{user.userId}</span>
            </div>

            <button onClick={logout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            {/* Mobile menu */}
            <button className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 border-t border-white/5 mt-1 pt-3 space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5"
                onClick={() => setMenuOpen(false)}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span className="text-xs text-gray-500">User ID: </span>
              <span className="text-xs font-mono text-blue-400">{user.userId}</span>
            </div>
            <button onClick={logout}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
