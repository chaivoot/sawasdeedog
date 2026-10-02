'use client'

import Link from 'next/link'
import { useIsAdmin } from '@/lib/use-is-admin'
import { Icon } from './Icon'

/** Floating "edit" shortcut, shown only to admins. */
export function AdminEditButton({ href }: { href: string }) {
  if (!useIsAdmin()) return null
  return (
    <Link href={href} className="admin-edit-fab" prefetch={false}>
      <Icon name="edit" size={18} strokeWidth={2} />
      แก้ไขรายการนี้
    </Link>
  )
}
