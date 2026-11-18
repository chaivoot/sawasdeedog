'use client'

import { usePathname } from 'next/navigation'

/** Renders its children everywhere except the admin back office, which has its own chrome. */
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null
  return children
}
