import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Shield } from 'lucide-react'
import { getAuthUser } from '@/lib/auth'

const sections = [
  {
    number: '1',
    title: 'Registration Fee',
    items: [
      'Users must pay a one-time registration fee of ₹120 to access the platform.',
      'Out of ₹120: ₹20 is charged as platform/service fee, and ₹100 is allocated to the automated trading wallet for trading activities.',
      'The registration fee is strictly non-refundable under any circumstances.',
    ],
  },
  {
    number: '2',
    title: 'Eligibility',
    items: [
      'Users must be at least 18 years old.',
      'Users are responsible for ensuring compliance with local laws related to financial trading.',
      'Platform use or referral is with own responsibilities and carefully for everyone.',
    ],
  },
  {
    number: '3',
    title: 'Automated Trading',
    items: [
      'The platform uses automated systems to execute trades using the allocated trading amount.',
      'Trading involves market risks, and profits or losses may occur.',
      'The platform does not guarantee fixed returns, profits, or earnings.',
      'If at any time any problem occurs, no one is responsible for this platform and no blame to others. Users are not taking legal steps against the platform, company, or anyone.',
    ],
  },
  {
    number: '4',
    title: 'Risk Disclosure',
    items: [
      'Financial trading carries substantial risk.',
      'Users acknowledge that capital loss may occur partially or fully.',
      'The platform, owners, directors, and partners shall not be liable for trading losses.',
      'If any technical problems or other types of problems occur, developers or technical teams are not responsible for anything.',
      'Users are self-responsible for all data and money-related issues.',
    ],
  },
  {
    number: '5',
    title: 'Referral Program',
    items: [
      'Users may receive referral rewards according to the platform\'s referral program.',
      'Referral benefits may be modified, suspended, or terminated at any time without prior notice.',
      'Fraudulent referrals, fake accounts, or abuse will lead to account termination.',
    ],
  },
  {
    number: '6',
    title: 'Withdrawals',
    items: [
      'Withdrawal requests are subject to platform rules, verification, and processing timelines.',
      'The platform reserves the right to delay or reject withdrawals in cases of suspicious activity.',
    ],
  },
  {
    number: '7',
    title: 'Account Security',
    items: [
      'Users are responsible for maintaining account confidentiality.',
      'Sharing login credentials with others is discouraged.',
      'The platform is not liable for losses caused by unauthorized access due to user negligence.',
    ],
  },
  {
    number: '8',
    title: 'Prohibited Activities',
    intro: 'Users may not:',
    items: [
      'Create fake or duplicate accounts',
      'Engage in fraud or money laundering',
      'Attempt unauthorized access to the platform',
      'Manipulate referral systems',
    ],
    footer: 'Violation may result in account suspension or termination.',
  },
  {
    number: '9',
    title: 'Service Availability',
    items: [
      'We aim to maintain uninterrupted services but do not guarantee continuous availability.',
      'Maintenance, technical issues, or third-party failures may cause downtime.',
    ],
  },
  {
    number: '10',
    title: 'Limitation of Liability',
    intro: 'The platform shall not be responsible for:',
    items: [
      'Trading losses',
      'Market volatility',
      'Technical failures',
      'Payment gateway disruptions',
      'Indirect financial damages',
    ],
  },
  {
    number: '11',
    title: 'Modification of Terms',
    items: [
      'The platform reserves the right to modify these Terms & Conditions at any time.',
      'Continued use after changes implies acceptance.',
    ],
  },
]

export default async function TermsPage() {
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
          <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Terms &amp; Conditions</h1>
          <p className="text-gray-400 text-sm">
            Welcome to Onexe. By registering and using our platform, you agree to the following Terms &amp; Conditions.
          </p>
          <p className="text-gray-600 text-xs mt-3">Last updated: June 2025</p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.number} className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">{s.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-semibold mb-3">{s.title}</h2>
                  {s.intro && (
                    <p className="text-gray-300 text-sm mb-2">{s.intro}</p>
                  )}
                  <ul className="space-y-2">
                    {s.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70 flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {s.footer && (
                    <p className="text-gray-400 text-sm mt-3 italic">{s.footer}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 p-4 rounded-xl text-center"
          style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <p className="text-gray-400 text-sm">
            By creating an account, you confirm that you have read, understood, and agreed to these Terms &amp; Conditions.
          </p>
          <Link href={backHref}
            className="inline-block mt-3 px-5 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors">
            {backLabel}
          </Link>
        </div>
      </main>
    </div>
  )
}
