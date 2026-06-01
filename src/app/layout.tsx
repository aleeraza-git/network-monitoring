import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Imarat Group — Network Status',
  description: 'Real-time infrastructure monitoring for Imarat Group of Companies',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dot-grid noise">{children}</body>
    </html>
  )
}
