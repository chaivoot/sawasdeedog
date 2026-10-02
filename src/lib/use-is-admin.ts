'use client'

import { useEffect, useState } from 'react'

// Public pages are cached for everyone, so admin-only UI asks /api/me in the
// browser. One request per page load, shared by every component that asks.
let pending: Promise<boolean> | undefined

function fetchIsAdmin(): Promise<boolean> {
  pending ??= fetch('/api/me', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : { admin: false }))
    .then((d: { admin?: boolean }) => d.admin === true)
    .catch(() => false)
  return pending
}

export function useIsAdmin(): boolean {
  const [admin, setAdmin] = useState(false)
  useEffect(() => {
    let alive = true
    fetchIsAdmin().then((a) => alive && setAdmin(a))
    return () => {
      alive = false
    }
  }, [])
  return admin
}
