import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans_Thai_Looped, Mitr } from 'next/font/google'
import { DEFAULT_OG_IMAGE, SITE_NAME, siteUrl } from '@/lib/site'
import './globals.css'

const mitr = Mitr({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mitr',
  display: 'swap',
})

const plexThaiLooped = IBM_Plex_Sans_Thai_Looped({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-thai-looped',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SawasdeeDog | หา Pet Friendly ที่จริงใจ ให้หมาคุณ',
    template: '%s | SawasdeeDog',
  },
  description: 'ค้นหาบริการต่างๆ ที่เราคัดมาแล้ว ให้กับน้องหมาของคุณเลย',
  metadataBase: new URL(siteUrl()),
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'th_TH',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: 'summary' },
  // Google Search Console HTML-tag verification (optional; DNS verification needs nothing here).
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
}

export const viewport: Viewport = {
  themeColor: '#F2F6FB',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${mitr.variable} ${plexThaiLooped.variable}`}>
      <body>{children}</body>
    </html>
  )
}
