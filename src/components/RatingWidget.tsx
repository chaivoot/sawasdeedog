'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyRating, rate, type MyRating } from '@/app/actions/ratings'
import { MIN_RATINGS_TO_SHOW } from '@/lib/limits'
import { Star } from './Stars'

type Stats = { count: number; avg: number }
const PENDING_KEY = 'sd_pending_rating'
const labels = ['', 'แย่', 'พอใช้', 'ดี', 'ดีมาก', 'ดีที่สุด']

/** Average + the viewer's own 1–5 stars. One rating per LINE account; changing it replaces the old one. */
export function RatingWidget({ slug, initial }: { slug: string; initial?: Stats }) {
  const router = useRouter()
  const [stats, setStats] = useState(initial)
  const [me, setMe] = useState<MyRating>()
  const [hover, setHover] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(stars: number) {
    setSaving(true)
    setMessage('')
    const res = await rate(slug, stars)
    setSaving(false)
    if (res.ok) {
      setMe((m) => ({ ...(m ?? { enabled: true }), loggedIn: true, stars: res.stars }))
      if (res.stats) setStats(res.stats)
      setMessage('บันทึกคะแนนแล้ว ขอบคุณครับ')
      router.refresh()
    } else if (res.login) {
      login(stars)
    } else {
      setMessage(res.error)
    }
  }

  function login(stars: number) {
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ slug, stars }))
    } catch {}
    // /auth/line is a route handler that redirects to LINE, so a full navigation is intended.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/auth/line?next=${encodeURIComponent(`/place/${slug}#rating`)}`
  }

  useEffect(() => {
    let cancelled = false
    getMyRating(slug).then(async (r) => {
      if (cancelled) return
      setMe(r)
      // Coming back from LINE login with a star the user picked before signing in.
      let pending: { slug: string; stars: number } | undefined
      try {
        pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? 'null') ?? undefined
        sessionStorage.removeItem(PENDING_KEY)
      } catch {}
      if (r.enabled && r.loggedIn && pending?.slug === slug && !r.stars) await submit(pending.stars)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per place
  }, [slug])

  if (me && !me.enabled) return null

  const shown = hover || me?.stars || 0
  const count = stats?.count ?? 0

  return (
    <section className="place__section place__rating rating" id="rating" aria-labelledby="rating-title">
      <h2 id="rating-title">คะแนนจากผู้ใช้</h2>
      <div className="rating__summary">
        {count >= MIN_RATINGS_TO_SHOW && stats ? (
          <>
            <span className="rating__avg">{stats.avg.toFixed(1)}</span>
            <span className="rating__stars" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={20} fill={Math.max(0, Math.min(1, stats.avg - i + 1))} />
              ))}
            </span>
            <span className="rating__count">จาก {count} คน</span>
          </>
        ) : (
          <span className="rating__count">
            {count === 0 ? 'ยังไม่มีคะแนน' : `มีคนให้คะแนนแล้ว ${count} คน`} · แสดงคะแนนเฉลี่ยเมื่อครบ{' '}
            {MIN_RATINGS_TO_SHOW} คน
          </span>
        )}
      </div>

      <div className="rating__mine">
        <span className="rating__label" id="rating-mine-label">
          {me?.stars ? 'คะแนนของคุณ (กดเพื่อเปลี่ยน)' : 'ให้คะแนนที่นี่'}
        </span>
        <div
          className="rating__input"
          role="radiogroup"
          aria-labelledby="rating-mine-label"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={me?.stars === i}
              aria-label={`${i} ดาว ${labels[i]}`}
              disabled={saving || !me}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(0)}
              onClick={() => (me?.loggedIn ? submit(i) : login(i))}
            >
              <Star size={32} fill={i <= shown ? 1 : 0} />
            </button>
          ))}
          {shown > 0 && <span className="rating__word">{labels[shown]}</span>}
        </div>
        {me && !me.loggedIn && (
          <span className="small-note">ต้องเข้าสู่ระบบด้วย LINE ก่อน 1 บัญชีให้ได้ 1 คะแนน</span>
        )}
        {message && (
          <span className="small-note" role="status">
            {message}
          </span>
        )}
      </div>
    </section>
  )
}
