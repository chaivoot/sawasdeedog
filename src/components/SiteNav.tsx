'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'หมวดทั้งหมด' },
  { href: '/criteria', label: 'เกณฑ์การคัดเลือก' },
]

export function SiteNav() {
  const pathname = usePathname()
  return (
    <nav className="site-nav" aria-label="เมนูหลัก">
      {links.map((l) => (
        <Link key={l.href} href={l.href} aria-current={pathname === l.href ? 'page' : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
