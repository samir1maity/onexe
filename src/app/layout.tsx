import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OneX — Trading Platform',
  description: 'Modern investment and trading platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="animated-bg min-h-screen">
        {children}
      </body>
    </html>
  )
}
