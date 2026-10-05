'use client'

import { useEffect, useState } from 'react'
import type { LatLng } from '@/lib/geo'
import { requestPosition, savedPosition } from '@/lib/near-me'

// One request for all tiles on the page.
let pending: { key: string; counts: Promise<Record<string, number>> } | undefined

function nearCounts(p: LatLng) {
  const key = `${p.lat},${p.lng}`
  if (pending?.key !== key)
    pending = {
      key,
      counts: fetch(`/api/nearby-counts?lat=${p.lat}&lng=${p.lng}`)
        .then((r) => (r.ok ? r.json() : { counts: {} }))
        .then((d: { counts?: Record<string, number> }) => d.counts ?? {}),
    }
  return pending.counts
}

/** The visitor's position without asking: the saved one, or a fresh one if already allowed. */
async function knownPosition(): Promise<LatLng | undefined> {
  const saved = savedPosition()
  if (saved) return saved
  try {
    const perm = await navigator.permissions?.query({ name: 'geolocation' })
    if (perm?.state === 'granted') return await requestPosition()
  } catch {}
  return undefined
}

/** " (ใกล้ฉัน 2)" after a home tile's count, in "ใกล้ฉัน" mode once the position is known. */
export function NearCount({ category }: { category: string }) {
  const [n, setN] = useState<number>()
  useEffect(() => {
    let live = true
    knownPosition()
      .then((p) => (p ? nearCounts(p) : undefined))
      .then((counts) => {
        if (live && counts && category in counts) setN(counts[category])
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [category])
  if (n === undefined) return null
  return (
    <>
      {' '}
      <span className="near-count">({n > 0 ? `ใกล้ฉัน ${n}` : 'ไม่มีใกล้ฉัน'})</span>
    </>
  )
}
