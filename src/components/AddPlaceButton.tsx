'use client'

import Link from 'next/link'
import { useIsAdmin } from '@/lib/use-is-admin'
import { Icon } from './Icon'

/** Header call to action: visitors suggest a place; admins go to the place list (add, import or edit from there). */
export function AddPlaceButton({ variant }: { variant: 'pill' | 'button' }) {
  const admin = useIsAdmin()
  const href = admin ? '/admin/places' : '/submit'
  const label = admin ? 'เพิ่มสถานที่' : 'เสนอสถานที่'
  return variant === 'pill' ? (
    <Link href={href} className="submit-pill">
      <Icon name="plus" size={18} strokeWidth={2.2} />
      {label}
    </Link>
  ) : (
    <Link href={href} className="btn btn--primary btn--sm">
      <Icon name="plus" size={20} strokeWidth={2.2} />
      <span>{label}</span>
    </Link>
  )
}
