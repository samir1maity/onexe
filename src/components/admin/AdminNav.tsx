'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, LogOut, Users, DollarSign, Settings, LayoutDashboard } from 'lucide-react'
import type { JWTPayload } from '@/lib/auth'

interface Props { user: JWTPayload }

export default function AdminNav({ user }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/amount', label: 'Amounts', icon: DollarSign },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-white/5"
      style={{ background: 'rgba(10, 14, 26, 0.95)', backdropFilter: 'blur(10px)', willChange: 'backdrop-filter' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center">
              <Image src="/ONEXE-logo.png" alt="Onexe" width={120} height={40} className="object-contain" />
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 font-medium">Admin</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-gray-500 font-mono">{user.userId}</span>
            <button onClick={logout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

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
