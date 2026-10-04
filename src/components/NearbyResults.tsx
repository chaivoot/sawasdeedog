'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Place } from '@/data/places'
import { NEAR_ME_KM } from '@/lib/limits'
import { listingHref, type ListingParams } from '@/lib/listing'
import {
  clearSavedPosition,
  positionErrorText,
  requestPosition,
  savedPosition,
  type PositionError,
} from '@/lib/near-me'
import { EmptyState } from './EmptyState'
import { ListingCard } from './ListingCard'

type Result = {
  area: { name: string; path: string } | null
  near: { place: Place; km: number; approx: boolean }[]
  local: Place[]
}

type State = { kind: 'locating' } | { kind: 'error'; message: string } | { kind: 'done'; result: Result }

/** "ใกล้ฉัน" list: storefronts by distance, then services that visit the visitor's area. */
export function NearbyResults({
  category,
  noun,
  params,
}: {
  category: string
  /** e.g. "คาเฟ่" for the empty state. */
  noun: string
  params: ListingParams
}) {
  const [state, setState] = useState<State>({ kind: 'locating' })
  // Bumped by "หาตำแหน่งใหม่" to drop the saved position and ask the browser again.
  const [attempt, setAttempt] = useState(0)
  const query = listingHref('', { ...params, near: false }).replace(/^\?/, '')

  useEffect(() => {
    let alive = true
    async function run() {
      try {
        const pos = savedPosition() ?? (await requestPosition())
        const res = await fetch(
          `/api/nearby?category=${category}&lat=${pos.lat}&lng=${pos.lng}${query ? `&${query}` : ''}`,
          { cache: 'no-store' },
        )
        if (!res.ok) throw new Error('nearby failed')
        const result = (await res.json()) as Result
        if (alive) setState({ kind: 'done', result })
      } catch (err) {
        const message =
          typeof err === 'string' && err in positionErrorText
            ? positionErrorText[err as PositionError]
            : 'โหลดรายการใกล้คุณไม่สำเร็จ ลองใหม่อีกครั้ง หรือเลือกย่านเองแทน'
        if (alive) setState({ kind: 'error', message })
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [category, query, attempt])

  function relocate() {
    clearSavedPosition()
    setState({ kind: 'locating' })
    setAttempt((n) => n + 1)
  }

  // Shows where we think the visitor is, so a wrong fix (Wi-Fi/IP based) is easy to spot.
  const where = (area: Result['area']) => (
    <p className="nearby__where">
      {area ? (
        <>
          ตำแหน่งของคุณ: แถว<strong>{area.name}</strong>
        </>
      ) : (
        'ตำแหน่งของคุณ: นอกพื้นที่ที่เรารู้จัก'
      )}
      {' · '}
      <button type="button" className="nearby__relocate" onClick={relocate}>
        หาตำแหน่งใหม่
      </button>
    </p>
  )

  if (state.kind === 'locating')
    return (
      <p className="nearby__status" role="status">
        กำลังหาที่ใกล้คุณ…
      </p>
    )
  if (state.kind === 'error')
    return (
      <p className="nearby__status nearby__status--error">
        {state.message}{' '}
        <button type="button" className="nearby__relocate" onClick={relocate}>
          ลองอีกครั้ง
        </button>
      </p>
    )

  const { area, near, local } = state.result
  if (near.length === 0 && local.length === 0)
    return (
      <>
        {where(area)}
        <EmptyState
          title={`ยังไม่มี${noun}ในระยะ ${NEAR_ME_KM} กม.`}
          body="เรายังคัดไม่ครบทุกย่าน ถ้ารู้จักที่ดี ๆ แถวนี้ เสนอให้ทีมช่วยเช็คได้เลย"
          primary={{ href: '/submit', label: 'เสนอสถานที่' }}
          secondary={area ? { href: area.path, label: `ดูทั้งหมดใน${area.name}` } : undefined}
        />
      </>
    )

  return (
    <>
      {where(area)}
      {near.map(({ place, km, approx }) => (
        <ListingCard
          key={place.slug}
          place={place}
          listing={category}
          distanceKm={km}
          distanceApprox={approx}
        />
      ))}
      {local.length > 0 && (
        <>
          <h2 className="nearby__group">
            {near.length > 0 ? 'ให้บริการถึงที่ / อยู่ในย่านเดียวกัน' : 'ในย่านของคุณ'}
            {area && <span className="muted"> · {area.name}</span>}
          </h2>
          {local.map((place) => (
            <ListingCard key={place.slug} place={place} listing={category} />
          ))}
        </>
      )}
      <p className="nearby__credit">
        แสดงที่อยู่ในระยะ {NEAR_ME_KM} กม. · ระยะทางเป็นเส้นตรง (“ประมาณ” = วัดถึงกลางเขตที่ให้บริการ) ·
        ย่านจาก{' '}
        <Link href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
          © OpenStreetMap
        </Link>
      </p>
    </>
  )
}
