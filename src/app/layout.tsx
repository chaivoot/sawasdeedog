import type { Metadata, Viewport } from 'next'
import { Anuphan, Prompt } from 'next/font/google'
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, siteUrl } from '@/lib/site'
import './globals.css'

// Both by Cadson Demak: Prompt for headings, Anuphan (a variable font, every weight) for text.
const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-prompt',
  display: 'swap',
})

const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  variable: '--font-anuphan',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SawasdeeDog | รวมคาเฟ่ ที่พัก โรงพยาบาลสัตว์ หมาเข้าได้จริง',
    template: '%s | SawasdeeDog',
  },
  description: SITE_DESCRIPTION,
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
  themeColor: '#FBF6EC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${prompt.variable} ${anuphan.variable}`}>
      <body>{children}</body>
    </html>
  )
}
