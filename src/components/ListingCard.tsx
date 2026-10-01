import Link from 'next/link'
import { getCategory } from '@/data/categories'
import { findArea } from '@/data/areas'
import { getBreed } from '@/data/breeds'
import type { Place } from '@/data/places'
import { Checked } from './Checked'
import { Icon } from './Icon'
import { Photo } from './Photo'
import { RatingBadge } from './Stars'

/** Row card on mobile, photo-top card on desktop (M-Category / D-Category). */
export function ListingCard({ place }: { place: Place }) {
  const category = getCategory(place.category)
  const area = findArea(place.province, place.district)
  const typeLabel = category?.types?.find((t) => t.slug === place.type)?.label ?? category?.name ?? ''
  const tags =
    place.category === 'farm'
      ? (place.breeds ?? []).map((b) => getBreed(b)?.name).filter(Boolean)
      : place.attributes.map((a) => category?.filters.find((f) => f.slug === a)?.label).filter(Boolean)

  return (
    <Link href={`/place/${place.slug}`} className="listing-card">
      <Photo src={place.photos[0]} alt={place.name} />
      <div className="listing-card__body">
        <span className="listing-card__name">{place.name}</span>
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
        <div className="listing-card__checked">
          <Checked date={place.checkedAt} />
        </div>
      </div>
    </Link>
  )
}
