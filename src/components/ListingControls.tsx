'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trainerStyles, type Option } from '@/data/categories'
import { listingHref, type ListingParams } from '@/lib/listing'
import { Icon } from './Icon'

function useNavigate(basePath: string) {
  const router = useRouter()
  return (p: ListingParams) => router.push(listingHref(basePath, p), { scroll: false })
}

type FilterProps = {
  basePath: string
  params: ListingParams
  types?: Option[]
  filters: Option[]
  /** Desktop label for the filter checkboxes. */
  filterLabel?: string
}

/** Type segmented control + filter chips (mobile) / checkboxes (desktop). */
export function ListingFilters({ basePath, params, types, filters, filterLabel = 'ตัวกรอง' }: FilterProps) {
  const navigate = useNavigate(basePath)

  function toggle(slug: string) {
    const next = params.filters.includes(slug)
      ? params.filters.filter((f) => f !== slug)
      : [...params.filters, slug]
    // Keep the URL stable regardless of click order.
    const ordered = filters.map((f) => f.slug).filter((s) => next.includes(s))
    navigate({ ...params, filters: ordered })
  }

  return (
    <>
      {types && types.length > 0 && (
        <div className="filter-group">
          <span className="filter-group__label desktop-only" id="type-label">
            ประเภท
          </span>
          <div className="segmented" role="tablist" aria-labelledby="type-label">
            {[{ slug: '', label: 'ทั้งหมด' }, ...types].map((t) => (
              <button
                key={t.slug}
                type="button"
                role="tab"
                aria-selected={(params.type ?? '') === t.slug}
                onClick={() => navigate({ ...params, type: t.slug || undefined })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {filters.length > 0 && (
        <>
          <div className="chip-row mobile-only" role="group" aria-label={filterLabel}>
            {filters.map((f) => {
              const active = params.filters.includes(f.slug)
              return (
                <button
                  key={f.slug}
                  type="button"
                  className="chip"
                  aria-pressed={active}
                  onClick={() => toggle(f.slug)}
                >
                  {active && <Icon name="check" size={18} strokeWidth={2.4} />}
                  {f.label}
                </button>
              )
            })}
          </div>

          <fieldset className="filter-group desktop-only" style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="filter-group__label" style={{ padding: 0, marginBottom: 10 }}>
              {filterLabel}
            </legend>
            {filters.map((f) => (
              <label key={f.slug} className="checkbox">
                <input
                  type="checkbox"
                  checked={params.filters.includes(f.slug)}
                  onChange={() => toggle(f.slug)}
                />
                {f.label}
              </label>
            ))}
          </fieldset>

          {(params.filters.length > 0 || params.type) && (
            <button
              type="button"
              className="text-link desktop-only"
              onClick={() => navigate({ style: params.style, filters: [] })}
            >
              ล้างตัวกรอง
            </button>
          )}
        </>
      )}
    </>
  )
}

/** R+ / Balance tabs. Both tabs share one style on purpose. */
export function TrainerTabs({ basePath, params }: { basePath: string; params: ListingParams }) {
  const navigate = useNavigate(basePath)
  const current = trainerStyles.find((s) => s.slug === params.style) ?? trainerStyles[0]
  return (
    <div className="trainer-tabs">
      <div className="tabs" role="tablist" aria-label="แนวการฝึก">
        {trainerStyles.map((s) => (
          <button
            key={s.slug}
            type="button"
            role="tab"
            aria-selected={s.slug === current.slug}
            onClick={() => navigate({ ...params, style: s.slug })}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p>
        {current.blurb} <Link href="/criteria#trainer">ดูเกณฑ์การจัดกลุ่ม</Link>
      </p>
    </div>
  )
}
