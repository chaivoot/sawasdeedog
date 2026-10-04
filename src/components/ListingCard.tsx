import Link from 'next/link'
import { extraTypeOptions, getCategory } from '@/data/categories'
import { findArea } from '@/data/areas'
import { getBreed } from '@/data/breeds'
import type { Place } from '@/data/places'
import { formatKm } from '@/lib/geo'
import { Checked } from './Checked'
import { Icon } from './Icon'
import { Photo } from './Photo'
import { RatingBadge } from './Stars'

/**
 * Row card on mobile, photo-top card on desktop (M-Category / D-Category).
 * `listing` is the category page showing the card; its filters decide the tags.
 */
export function ListingCard({
  place,
  listing,
  distanceKm,
  distanceApprox,
}: {
  place: Place
  listing?: string
  /** Shown on "ใกล้ฉัน" results. */
  distanceKm?: number
  /** Measured to a district centre, not the place's own pin. */
  distanceApprox?: boolean
}) {
  const category = getCategory(place.category)
  const tagCategory = getCategory(listing ?? place.category)
  const area = findArea(place.province, place.district)
  // Pinned to the top of this list by the team. Shown quietly, without calling it a recommendation.
  const pinned = !!listing && (place.pinnedIn ?? []).includes(listing)
  // Listed under one of its extra categories: describe it in that category's terms.
  const typeLabel =
    tagCategory && tagCategory !== category
      ? (extraTypeOptions(tagCategory).find((t) => place.attributes.includes(t.slug))?.label ??
        tagCategory.name)
      : (category?.types?.find((t) => t.slug === place.type)?.label ?? category?.name ?? '')
  const tags =
    place.category === 'farm'
      ? (place.breeds ?? []).map((b) => getBreed(b)?.name).filter(Boolean)
      : place.attributes.map((a) => tagCategory?.filters.find((f) => f.slug === a)?.label).filter(Boolean)

  return (
    <Link href={`/place/${place.slug}`} className="listing-card">
      <Photo src={place.photos[0]} alt={place.name} small />
      <div className="listing-card__body">
        <span className="listing-card__name">
          {place.name}
          {pinned && (
            <span className="listing-card__pin" title="ปักหมุด">
              <Icon name="pushpin" size={14} strokeWidth={2} />
              <span className="sr-only">ปักหมุด</span>
            </span>
          )}
        </span>
        <RatingBadge rating={place.rating} />
        {place.category === 'farm' ? (
          <>
            <span className="listing-card__province mobile-only">
              <Icon name="pin" size={15} strokeWidth={2} />
              จ.{area?.province.name}
            </span>
            <span className="listing-card__meta desktop-only">ฟาร์ม · จ.{area?.province.name}</span>
          </>
        ) : (
          <span className="listing-card__meta">
            {typeLabel} · {area ? (area.district?.name ?? area.province.name) : ''}
            {!place.mapsUrl && place.serviceAreas?.length ? ' · บริการถึงที่' : ''}
            {place.maxDogKg ? ` · น้องไม่เกิน ${place.maxDogKg} กก.` : ''}
          </span>
        )}
        {tags.length > 0 && (
          <div className="tag-list">
            {tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        )}
        {distanceKm != null && (
          <span className="listing-card__distance">
            <Icon name="nav" size={14} strokeWidth={2} />
            {distanceApprox && 'ประมาณ '}
            {formatKm(distanceKm)}
          </span>
        )}
        <div className="listing-card__checked">
          <Checked date={place.checkedAt} />
        </div>
      </div>
    </Link>
  )
}
