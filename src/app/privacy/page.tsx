import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Lock } from 'lucide-react'
import { getAuthUser } from '@/lib/auth'

const sections = [
  {
    number: '1',
    title: 'Information We Collect',
    intro: 'We may collect:',
    items: [
      'Name',
      'Phone number (Optional)',
      'Email address',
      'Payment information (Optional)',
      'Device/IP information',
      'Transaction history',
    ],
  },
  {
    number: '2',
    title: 'Use of Information',
    intro: 'We use collected data to:',
    items: [
      'Create user accounts',
      'Process payments',
      'Execute automated trading',
      'Manage referrals',
      'Improve platform performance',
      'Prevent fraud',
    ],
  },
  {
    number: '3',
    title: 'Data Protection',
    items: [
      'We implement reasonable security measures to protect user data.',
      'However, no internet transmission is 100% secure.',
    ],
  },
  {
    number: '4',
    title: 'Sharing of Information',
    intro: 'We do not sell personal information. Information may be shared with:',
    items: [
      'Payment gateways',
      'Trading partners/APIs',
      'Legal authorities when required by law',
    ],
  },
  {
    number: '5',
    title: 'Cookies & Tracking',
    items: [
      'We may use cookies and analytics tools to improve user experience and monitor performance.',
    ],
  },
  {
    number: '6',
    title: 'User Rights',
    intro: 'Users may request:',
    items: [
      'Access to personal data',
      'Correction of inaccurate data',
      'Account deletion (subject to legal obligations)',
    ],
  },
  {
    number: '7',
    title: 'Data Retention',
    items: [
      'We retain user data as long as necessary for operational, legal, and compliance purposes.',
    ],
  },
  {
    number: '8',
    title: 'Policy Changes',
    items: [
      'We may update this Privacy Policy periodically.',
      'Continued use implies acceptance of revised policies.',
    ],
  },
]

export default async function PrivacyPage() {
  const user = await getAuthUser()
  const backHref = user ? '/dashboard' : '/register'
  const backLabel = user ? 'Back to Dashboard' : 'Back to Register'
  return (
    <div className="min-h-screen grid-pattern">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={backHref} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
          <Link href="/">
            <Image src="/ONEXE-logo.png" alt="Onexe" width={100} height={34} className="object-contain" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-20">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">
            Your privacy matters to us. This policy explains how Onexe collects, uses, and protects your information.
          </p>
          <p className="text-gray-600 text-xs mt-3">Last updated: June 2025</p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.number} className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-violet-400 text-xs font-bold">{s.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-semibold mb-3">{s.title}</h2>
                  {s.intro && (
                    <p className="text-gray-300 text-sm mb-2">{s.intro}</p>
                  )}
                  <ul className="space-y-2">
                    {s.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/70 flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 p-4 rounded-xl text-center"
          style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
          <p className="text-gray-400 text-sm">
            By creating an account, you confirm that you have read and understood our Privacy Policy.
          </p>
          <Link href={backHref}
            className="inline-block mt-3 px-5 py-2 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-400 text-sm font-medium hover:bg-violet-500/30 transition-colors">
            {backLabel}
          </Link>
        </div>
      </main>
    </div>
  )
}
