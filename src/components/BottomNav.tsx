'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from './Icon'

const tabs: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'สถานที่', icon: 'home' },
  { href: '/items', label: 'ไอเทม', icon: 'bag' },
  { href: '/stories', label: 'เรื่องหมาๆ', icon: 'book' },
  { href: '/contact', label: 'ติดต่อ', icon: 'chat' },
]

/** Section of the site a path belongs to; everything outside the others is places. */
function activeTab(pathname: string): string {
  const hit = tabs.find((t) => t.href !== '/' && (pathname === t.href || pathname.startsWith(`${t.href}/`)))
  return hit?.href ?? '/'
}

/** Mobile tab bar along the bottom of the screen; hidden on desktop. */
export function BottomNav() {
  const active = activeTab(usePathname())
  return (
    <nav className="bottom-nav" aria-label="เมนูหลัก">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} aria-current={active === t.href ? 'page' : undefined}>
          <Icon name={t.icon} size={22} strokeWidth={active === t.href ? 2.1 : 1.8} />
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
