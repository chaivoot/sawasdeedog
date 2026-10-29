'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AREA_COOKIE, NEAR_ME, findArea, popularProvinces, provinces } from '@/data/areas'
import { track } from '@/lib/analytics'
import { positionErrorText, requestPosition, type PositionError } from '@/lib/near-me'
import { Icon } from './Icon'

type Props = {
  province?: string
  district?: string
  /** On a category page, confirming navigates to that category in the new area. */
  category?: string
  /** "ใกล้ฉัน" is the current choice. */
  near?: boolean
}

const pickable = provinces.filter((p) => p.districts.length > 0)

/** "อำเภอ หาดใหญ่" → "หาดใหญ่": people type the prefix and spaces, the names have neither. */
function normalize(text: string) {
  return text.replace(/\s+/g, '').replace(/^(อำเภอ|อ\.|เขต|ข\.|จังหวัด|จ\.)/, '')
}

export function AreaPicker({ province, district, category, near }: Props) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const current = findArea(province, district)

  const [provinceSlug, setProvinceSlug] = useState(current?.province.slug ?? pickable[0].slug)
  const [districtSlug, setDistrictSlug] = useState(current?.district?.slug ?? '')
  const [query, setQuery] = useState('')
  const [locating, setLocating] = useState(false)
  const [nearError, setNearError] = useState('')

  const selectedProvince = pickable.find((p) => p.slug === provinceSlug) ?? pickable[0]
  const q = normalize(query)
  const districts = selectedProvince.districts.filter((d) => !q || d.name.includes(q))
  // Typing searches every province, so a district outside the chosen one is still one tap away.
  const elsewhere = q
    ? pickable
        .filter((p) => p.slug !== provinceSlug)
        .flatMap((p) => [
          ...(p.name.includes(q) ? [{ province: p, district: undefined }] : []),
          ...p.districts.filter((d) => d.name.includes(q)).map((d) => ({ province: p, district: d })),
        ])
        .slice(0, 20)
    : []
  const selected = findArea(provinceSlug, districtSlug || undefined)
  // Popular provinces as chips, plus the chosen one if it came from the dropdown.
  const chipProvinces = pickable.filter((p) => popularProvinces.includes(p.slug) || p.slug === provinceSlug)

  function pickProvince(slug: string) {
    setProvinceSlug(slug)
    setDistrictSlug('')
    setQuery('')
  }

  /** Keeps the picked district as the search, so it stays in view with its check mark. */
  function pickElsewhere(province: string, district?: { slug: string; name: string }) {
    setProvinceSlug(province)
    setDistrictSlug(district?.slug ?? '')
    setQuery(district?.name ?? '')
  }

  function setCookie(value: string) {
    document.cookie = `${AREA_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
  }

  async function useMyLocation() {
    setLocating(true)
    setNearError('')
    try {
      await requestPosition()
      setCookie(NEAR_ME)
      track('near_me', { category })
      close()
      if (category) router.push(`/${category}?near=1`)
      else router.refresh()
    } catch (err) {
      setNearError(positionErrorText[err as PositionError] ?? positionErrorText.unavailable)
      track('near_me_failed', { category, reason: String(err) })
    } finally {
      setLocating(false)
    }
  }

  function open() {
    setNearError('')
    setProvinceSlug(current?.province.slug ?? pickable[0].slug)
    setDistrictSlug(current?.district?.slug ?? '')
    setQuery('')
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
  }

  /** Forget the chosen area and show every area. */
  function clearArea() {
    document.cookie = `${AREA_COOKIE}=; path=/; max-age=0; samesite=lax`
    close()
    if (category) router.push(`/${category}`)
    else router.refresh()
  }

  function confirm() {
    if (!selected) return
    const value = selected.province.slug + (selected.district ? `/${selected.district.slug}` : '')
    setCookie(value)
    track('area_pick', {
      category,
      province: selected.province.slug,
      district: selected.district?.slug,
    })
    close()
    if (category) router.push(`/${category}/${value}`)
    else router.refresh()
  }

  const selectedName = selected ? (selected.district?.name ?? `ทุกเขตใน${selected.province.name}`) : ''

  return (
    <>
      <div className="area-row">
        {/* One tap for "ใกล้ฉัน": what people searching "…ใกล้ฉัน" came for. */}
        <button
          type="button"
          className="near-chip"
          onClick={useMyLocation}
          disabled={locating}
          aria-pressed={near}
        >
          <Icon name="nav" size={20} strokeWidth={2} />
          <span>{locating ? 'กำลังหา…' : 'ใกล้ฉัน'}</span>
        </button>
        <button type="button" className="area-button" onClick={open} aria-haspopup="dialog">
          <Icon name="pin" size={20} strokeWidth={2} />
          <span className="area-button__value">
            <span className="muted">ย่าน</span>
            {near ? (
              <b>ใกล้ฉัน</b>
            ) : current ? (
              <>
                {/* Phones show just the district when there is one: the row also holds "ใกล้ฉัน". */}
                <b className={current.district ? 'area-button__province' : undefined}>
                  {current.province.name}
                </b>
                {current.district && (
                  <>
                    <span className="muted area-button__province" aria-hidden="true">
                      ›
                    </span>
                    <b>{current.district.name}</b>
                  </>
                )}
              </>
            ) : (
              <b>ทุกย่าน</b>
            )}
          </span>
          <span className="area-button__action">{current || near ? 'เปลี่ยน' : 'เลือก'}</span>
        </button>
      </div>
      {nearError && (
        <p className="area-row__error" role="alert">
          {nearError}
        </p>
      )}

      <dialog
        ref={dialogRef}
        className="sheet"
        aria-labelledby="area-picker-title"
        onClick={(e) => {
          if (e.target === dialogRef.current) close()
        }}
      >
        <div className="sheet__handle" />
        <div className="sheet__head">
          <h2 id="area-picker-title">เลือกย่าน</h2>
          <button type="button" className="icon-button sheet__close" aria-label="ปิด" onClick={close}>
            <Icon name="x" size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="sheet__section">
          <button
            type="button"
            className="btn btn--secondary btn--block near-me"
            onClick={useMyLocation}
            disabled={locating}
            aria-pressed={near}
          >
            <Icon name="nav" size={20} strokeWidth={2} />
            <span>{locating ? 'กำลังหาตำแหน่ง…' : 'ใกล้ฉัน (ใช้ตำแหน่งปัจจุบัน)'}</span>
          </button>
          {nearError && (
            <p className="sheet__empty" role="alert">
              {nearError}
            </p>
          )}
          {(current || near) && (
            <button type="button" className="area-clear" onClick={clearArea}>
              <Icon name="x" size={18} strokeWidth={2} />
              <span>ล้างย่านที่เลือก · ดูทุกย่าน</span>
            </button>
          )}
        </div>

        <div className="sheet__section">
          <span className="sheet__label" id="area-province-label">
            1. จังหวัด
          </span>
          <div className="chip-wrap" role="group" aria-labelledby="area-province-label">
            {chipProvinces.map((p) => {
              const active = p.slug === provinceSlug
              return (
                <button
                  key={p.slug}
                  type="button"
                  className="chip"
                  aria-pressed={active}
                  onClick={() => pickProvince(p.slug)}
                >
                  {active && <Icon name="check" size={18} strokeWidth={2.4} />}
                  {p.name}
                </button>
              )
            })}
          </div>
          <label className="sr-only" htmlFor="area-province-select">
            เลือกจังหวัดอื่น
          </label>
          <select
            id="area-province-select"
            className="select select--compact"
            value={popularProvinces.includes(provinceSlug) ? '' : provinceSlug}
            onChange={(e) => e.target.value && pickProvince(e.target.value)}
          >
            <option value="">จังหวัดอื่น ({pickable.length} จังหวัด)</option>
            {pickable.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sheet__section sheet__section--grow">
          <span className="sheet__label" id="area-district-label">
            2. เขต / อำเภอ
          </span>
          <label className="search-field search-field--sheet">
            <Icon name="search" size={20} strokeWidth={2} />
            <span className="sr-only">ค้นหาเขต</span>
            <input
              type="search"
              placeholder="พิมพ์ชื่อเขต / อำเภอ"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="sheet__list" role="group" aria-labelledby="area-district-label">
            {!q && (
              <button
                type="button"
                className="sheet__option"
                aria-pressed={districtSlug === ''}
                onClick={() => setDistrictSlug('')}
              >
                <span>ทุกเขตใน{selectedProvince.name}</span>
                {districtSlug === '' && <Icon name="check" size={20} strokeWidth={2.4} />}
              </button>
            )}
            {districts.map((d) => (
              <button
                key={d.slug}
                type="button"
                className="sheet__option"
                aria-pressed={districtSlug === d.slug}
                onClick={() => setDistrictSlug(d.slug)}
              >
                <span>{d.name}</span>
                {districtSlug === d.slug && <Icon name="check" size={20} strokeWidth={2.4} />}
              </button>
            ))}
            {q && districts.length === 0 && (
              <p className="sheet__empty">
                ไม่พบ “{q}” ใน{selectedProvince.name}
              </p>
            )}
            {elsewhere.length > 0 && <p className="sheet__sublabel">ในจังหวัดอื่น</p>}
            {elsewhere.map(({ province: p, district: d }) => (
              <button
                key={`${p.slug}/${d?.slug ?? ''}`}
                type="button"
                className="sheet__option"
                aria-pressed={false}
                onClick={() => pickElsewhere(p.slug, d)}
              >
                <span>{d ? d.name : `ทุกอำเภอใน${p.name}`}</span>
                <span className="muted">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="btn btn--primary btn--lg btn--block" onClick={confirm}>
          {category ? `ดูรายการใน${selectedName}` : `เลือก${selectedName}`}
        </button>
      </dialog>
    </>
  )
}
