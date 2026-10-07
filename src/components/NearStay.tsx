import Link from 'next/link'
import { getCategory } from '@/data/categories'
import { findArea } from '@/data/areas'
import type { Place } from '@/data/places'
import { nearestTo } from '@/lib/nearby'
import { listPlaces } from '@/lib/places'
import { ListingCard } from './ListingCard'

// What a stay's guests look for nearby: a vet first (in case the dog is hurt
// or ill on the trip), then somewhere to eat together. Vets are worth a longer drive.
const GROUPS = [
  { category: 'vet', title: 'โรงพยาบาลสัตว์ใกล้ที่พัก', maxKm: 30 },
  { category: 'cafe', title: 'คาเฟ่ & ร้านอาหารที่พาน้องเข้าได้', maxKm: 10 },
]
const PER_GROUP = 3

/** "ใกล้ที่พักนี้" on a stay's page; nothing when the stay has no pin or nothing listed is near. */
export async function NearStay({ place }: { place: Place }) {
  if (place.lat == null || place.lng == null) return null
  const here = { lat: place.lat, lng: place.lng }
  const area = findArea(place.province)
  const groups = (
    await Promise.all(
      GROUPS.map(async (g) => ({
        ...g,
        near: nearestTo(
          (await listPlaces({ category: g.category })).filter((p) => p.slug !== place.slug),
          here,
          g.maxKm,
        ).slice(0, PER_GROUP),
      })),
    )
  ).filter((g) => g.near.length > 0)
  if (groups.length === 0) return null

  return (
    <section className="place__section place__nearby" aria-labelledby="near-stay">
      <h2 id="near-stay">ใกล้ที่พักนี้</h2>
      {groups.map((g) => (
        <div key={g.category} className="place__nearby-group">
          <h3>{g.title}</h3>
          <div className="place__nearby-list">
            {g.near.map(({ place: p, km, approx }) => (
              <ListingCard
                key={p.slug}
                place={p}
                listing={g.category}
                distanceKm={km}
                distanceApprox={approx}
              />
            ))}
          </div>
          {area && g.near.some((n) => n.place.province === place.province) && (
            <Link href={`/${g.category}/${area.province.slug}`} className="place__nearby-more">
              ดู{getCategory(g.category)?.name}ทั้งหมดใน{area.province.name}
            </Link>
          )}
        </div>
      ))}
      <p className="place__nearby-note">ระยะทางเป็นเส้นตรง (“ประมาณ” = วัดถึงกลางเขตที่ให้บริการ)</p>
    </section>
  )
}
