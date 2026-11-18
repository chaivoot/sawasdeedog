import { getCategory } from '@/data/categories'
import { findArea } from '@/data/areas'
import type { Place } from '@/data/places'

/**
 * Search title and description for a place page.
 *
 * Most searches that reach a place page are for the place by name ("โรงพยาบาลสัตว์ทวีสุข"),
 * where the result sits under the place's own site and Google Maps. So the title leads with
 * the name and area, then says what the page answers (open 24 h, phone, hours, map) rather
 * than repeating the category; a pet-friendly tag stays for categories where that is the point.
 */

/** What the listing tells searchers that a plain business page might not. */
const CATEGORY_TAG: Record<string, string> = {
  cafe: 'หมาเข้าได้',
  stay: 'หมาพักได้',
}

function whereOf(place: Pick<Place, 'province' | 'district'>): string {
  const area = findArea(place.province, place.district)
  if (!area) return ''
  if (!area.district) return area.province.name
  // "เมืองสระแก้ว" already names the province: no "เมืองสระแก้ว สระแก้ว".
  return area.district.name.endsWith(area.province.name)
    ? area.district.name
    : `${area.district.name} ${area.province.name}`
}

/** "เบอร์โทร เวลาเปิด แผนที่", only for what the page actually shows. */
function answers(place: Place): string {
  return [place.contacts.phone && 'เบอร์โทร', place.hours && 'เวลาเปิด', place.mapsUrl && 'แผนที่']
    .filter(Boolean)
    .join(' ')
}

export function placeTitle(place: Place): string {
  const category = getCategory(place.category)
  const where = whereOf(place)
  // A vet named "โรงพยาบาลสัตว์…" or "คลินิกรักษาสัตว์…" needs no category after it.
  const tag =
    CATEGORY_TAG[place.category] ??
    (place.category === 'vet' && /สัตว/.test(place.name) ? '' : (category?.name ?? ''))
  const open24 = place.attributes.includes('open-24h') ? 'เปิด 24 ชม.' : ''
  return [[place.name, where].filter(Boolean).join(' '), tag, open24, answers(place)]
    .filter(Boolean)
    .join(' · ')
}

export function placeDescription(place: Place): string {
  const category = getCategory(place.category)
  const where = whereOf(place)
  const lead = [
    `${place.name}${where ? ` ${where}` : ''}`,
    place.attributes.includes('open-24h') ? 'เปิด 24 ชั่วโมง' : place.hours ? `เปิด ${place.hours}` : '',
  ]
    .filter(Boolean)
    .join(' ')
  // Hours already in the lead; ask the click for the rest.
  const what = [place.contacts.phone && 'เบอร์โทร', place.mapsUrl && 'แผนที่'].filter(Boolean).join(' ')
  const body =
    place.description ?? `${category?.name ?? ''}${where ? `ใน${where}` : ''} ที่ทีม SawasdeeDog คัดแล้ว`
  return `${lead}${what ? ` ดู${what}ได้ที่นี่` : ''} · ${body}`
}
