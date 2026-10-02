'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from './Icon'

/** Floating "edit" shortcut, shown only to admins (checked per visitor; the page itself is cached). */
export function AdminEditButton({ href }: { href: string }) {
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    let alive = true
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { admin: false }))
      .then((d: { admin?: boolean }) => alive && setAdmin(d.admin === true))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  if (!admin) return null
  return (
    <Link href={href} className="admin-edit-fab" prefetch={false}>
      <Icon name="edit" size={18} strokeWidth={2} />
      แก้ไขรายการนี้
    </Link>
  )
}
