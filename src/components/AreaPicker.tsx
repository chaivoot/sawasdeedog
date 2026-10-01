'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AREA_COOKIE, findArea, popularProvinces, provinces } from '@/data/areas'
import { Icon } from './Icon'

type Props = {
  province?: string
  district?: string
  /** On a category page, confirming navigates to that category in the new area. */
  category?: string
}

const pickable = provinces.filter((p) => p.districts.length > 0)

export function AreaPicker({ province, district, category }: Props) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const current = findArea(province, district)

  const [provinceSlug, setProvinceSlug] = useState(current?.province.slug ?? pickable[0].slug)
  const [districtSlug, setDistrictSlug] = useState(current?.district?.slug ?? '')
  const [query, setQuery] = useState('')

  const selectedProvince = pickable.find((p) => p.slug === provinceSlug) ?? pickable[0]
  const q = query.trim()
  const districts = selectedProvince.districts.filter((d) => !q || d.name.includes(q))
  const selected = findArea(provinceSlug, districtSlug || undefined)
  // Popular provinces as chips, plus the chosen one if it came from the dropdown.
  const chipProvinces = pickable.filter((p) => popularProvinces.includes(p.slug) || p.slug === provinceSlug)

  function pickProvince(slug: string) {
    setProvinceSlug(slug)
    setDistrictSlug('')
    setQuery('')
  }

  function open() {
    setProvinceSlug(current?.province.slug ?? pickable[0].slug)
    setDistrictSlug(current?.district?.slug ?? '')
    setQuery('')
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
  }

  function confirm() {
    if (!selected) return
    const value = selected.province.slug + (selected.district ? `/${selected.district.slug}` : '')
    document.cookie = `${AREA_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    close()
    if (category) router.push(`/${category}/${value}`)
    else router.refresh()
  }

  const selectedName = selected ? (selected.district?.name ?? `ทุกเขตใน${selected.province.name}`) : ''

  return (
    <>
      <button type="button" className="area-button" onClick={open} aria-haspopup="dialog">
        <Icon name="pin" size={20} strokeWidth={2} />
        <span className="area-button__value">
          <span className="muted">ย่าน</span>
          {current ? (
            <>
              <b>{current.province.name}</b>
              {current.district && (
                <>
                  <span className="muted" aria-hidden="true">
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
        <span className="area-button__action">{current ? 'เปลี่ยน' : 'เลือก'}</span>
      </button>

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
              placeholder="พิมพ์ชื่อเขต"
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
            {q && districts.length === 0 && <p className="sheet__empty">ไม่พบเขตที่ชื่อ “{q}”</p>}
          </div>
        </div>

        <button type="button" className="btn btn--primary btn--lg btn--block" onClick={confirm}>
          {category ? `ดูรายการใน${selectedName}` : `เลือก${selectedName}`}
        </button>
      </dialog>
    </>
  )
}
