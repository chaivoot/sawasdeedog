import { getCategory } from '@/data/categories'
import { STAY_MIN_DOG_KG, takesWeightLimit } from '@/data/criteria'
import { placeCategories, type Place } from '@/data/places'
import { isAgodaUrl } from '@/lib/agoda'
import { facebookUrl, instagramHandle, lineLink, websiteUrl } from '@/lib/contacts'
import type { PlaceRow } from '@/lib/places'

// Updates to places already listed: research marked "update": true, matched by slug.
// Only the fields given change; a field given as null or "" is cleared. Name, slug,
// category, location and photos are never touched here (use the editor).

export type PlacePatch = Partial<
  Pick<
    PlaceRow,
    | 'description'
    | 'hours'
    | 'price'
    | 'pet_fee'
    | 'phone'
    | 'line'
    | 'instagram'
    | 'facebook'
    | 'website'
    | 'agoda_url'
    | 'max_dog_kg'
    | 'max_dogs'
    | 'type'
    | 'attributes'
    | 'published'
    | 'checked_at'
  >
>

export type Change = { label: string; from: string; to: string }

export type PatchItem = {
  slug: string
  /** The listed place's id and name; absent when the slug matched nothing. */
  id?: string
  name: string
  patch: PlacePatch
  changes: Change[]
  warnings: string[]
  notes: string[]
  sources: string[]
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '')
const strs = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : str(v) ? [str(v)] : [])
const show = (v: unknown) =>
  v == null || v === '' ? '—' : Array.isArray(v) ? v.join(', ') || '—' : String(v)

export const isUpdate = (raw: Record<string, unknown>) => raw.update === true

export function toPatch(raw: Record<string, unknown>, existing: Place[], today: string): PatchItem {
  const slug = str(raw.slug).toLowerCase()
  const place = existing.find((p) => p.slug === slug)
  const item: PatchItem = {
    slug,
    id: place?.id,
    name: place?.name ?? (str(raw.name) || slug),
    patch: {},
    changes: [],
    warnings: [],
    notes: strs(raw.notes),
    sources: strs(raw.sources).filter((s) => /^https?:\/\//.test(s)),
  }
  if (!place) {
    item.warnings.push(slug ? `ไม่พบร้าน slug "${slug}" ในระบบ` : 'ไม่มี slug ของร้านที่จะแก้')
    return item
  }

  const cats = placeCategories(place)
  const isStay = cats.includes('stay')
  const has = (k: string) => Object.prototype.hasOwnProperty.call(raw, k)
  const set = <K extends keyof PlacePatch>(key: K, label: string, value: PlacePatch[K], before: unknown) => {
    if (show(value) === show(before)) return
    item.patch[key] = value
    item.changes.push({ label, from: show(before), to: show(value) })
  }
  const text = (key: string, col: keyof PlacePatch, label: string, before: unknown) => {
    if (has(key)) set(col, label, (str(raw[key]) || null) as never, before)
  }

  text('description', 'description', 'คำบรรยาย', place.description)
  text('hours', 'hours', 'เวลาเปิด', place.hours)
  text('price', 'price', 'ราคา', place.price)
  text('phone', 'phone', 'เบอร์โทร', place.contacts.phone)

  // Contacts in the same canonical form the editor stores.
  const contact = (
    key: 'line' | 'instagram' | 'facebook' | 'website',
    label: string,
    clean: (v: string) => string | undefined,
  ) => {
    if (!has(key)) return
    const v = str(raw[key])
    const value = v ? clean(v) : null
    if (v && !value) item.warnings.push(`${label} "${v}" ไม่ถูกต้อง (ไม่ได้แก้)`)
    else set(key, label, value ?? null, place.contacts[key])
  }
  contact('line', 'LINE', (v) => (lineLink(v) ? v : undefined))
  contact('instagram', 'Instagram', instagramHandle)
  contact('facebook', 'Facebook', facebookUrl)
  contact('website', 'เว็บไซต์', websiteUrl)

  const stayOnly = (key: string) => {
    if (has(key) && !isStay) item.warnings.push(`${key} ใช้ได้เฉพาะที่พัก (ไม่ได้แก้)`)
    return has(key) && isStay
  }
  if (stayOnly('petFee')) set('pet_fee', 'ค่าน้องหมา', str(raw.petFee) || null, place.petFee)
  if (stayOnly('agodaUrl')) {
    const v = str(raw.agodaUrl)
    if (v && !isAgodaUrl(v)) item.warnings.push('ลิงก์ Agoda ไม่ใช่หน้า agoda.com (ไม่ได้แก้)')
    else set('agoda_url', 'ลิงก์ Agoda', v || null, place.agodaUrl)
  }
  if (stayOnly('maxDogs')) {
    const n = raw.maxDogs == null || raw.maxDogs === '' ? null : Number(raw.maxDogs)
    if (n !== null && !(Number.isInteger(n) && n > 0))
      item.warnings.push(`จำนวนน้องหมาต่อห้อง "${str(raw.maxDogs)}" ไม่ใช่ตัวเลข (ไม่ได้แก้)`)
    else set('max_dogs', 'น้องหมาต่อห้อง', n, place.maxDogs)
  }
  if (has('maxDogKg')) {
    const n = raw.maxDogKg == null || raw.maxDogKg === '' ? null : Number(raw.maxDogKg)
    if (!cats.some(takesWeightLimit)) item.warnings.push('หมวดนี้ไม่มีจำกัดน้ำหนัก (ไม่ได้แก้)')
    else if (n !== null && !(Number.isInteger(n) && n > 0))
      item.warnings.push(`น้ำหนักสูงสุด "${str(raw.maxDogKg)}" ไม่ใช่ตัวเลข (ไม่ได้แก้)`)
    else if (isStay && n !== null && n < STAY_MIN_DOG_KG)
      item.warnings.push(`รับน้องหมาแค่ ${n} กก. ไม่ผ่านเกณฑ์ที่พัก ต้องซ่อนหรือลบเอง (ไม่ได้แก้)`)
    else set('max_dog_kg', 'น้ำหนักสูงสุด (กก.)', n, place.maxDogKg)
  }

  const category = getCategory(place.category)
  if (has('type')) {
    const t = str(raw.type)
    if (t && !category?.types?.some((x) => x.slug === t))
      item.warnings.push(`ประเภท "${t}" ไม่ตรงกับหมวด (ไม่ได้แก้)`)
    else {
      set('type', 'ประเภท', t || null, place.type)
      const c = item.changes.find((x) => x.label === 'ประเภท')
      const label = (v: string) => category?.types?.find((x) => x.slug === v)?.label ?? v
      if (c) Object.assign(c, { from: label(c.from), to: label(c.to) })
    }
  }

  // Attributes replace the place's filters and warnings; extra-category types ("park:pool") stay.
  if (has('attributes')) {
    const known = new Map(
      cats
        .map((c) => getCategory(c))
        .flatMap((c) => [...(c?.filters ?? []), ...(c?.warnings ?? [])])
        .map((o) => [o.slug, o.label]),
    )
    const given = strs(raw.attributes)
    for (const a of given) if (!known.has(a)) item.warnings.push(`ไม่รู้จักเกณฑ์ "${a}" (ไม่ได้ใส่)`)
    const next = [
      ...new Set([...place.attributes.filter((a) => a.includes(':')), ...given.filter((a) => known.has(a))]),
    ]
    const label = (a: string) => known.get(a) ?? a
    const added = next.filter((a) => !place.attributes.includes(a))
    const removed = place.attributes.filter((a) => !next.includes(a))
    if (added.length || removed.length) {
      item.patch.attributes = next
      item.changes.push({
        label: 'เกณฑ์/ข้อจำกัด',
        from: removed.length ? `เอาออก: ${removed.map(label).join(', ')}` : '—',
        to: added.length ? `เพิ่ม: ${added.map(label).join(', ')}` : '—',
      })
    }
  }

  if (has('published')) {
    if (typeof raw.published !== 'boolean')
      item.warnings.push('published ต้องเป็น true หรือ false (ไม่ได้แก้)')
    else set('published', 'แสดงบนเว็บ', raw.published, place.published !== false)
  }

  // Changed after a fresh check: the check date moves too.
  if (item.changes.length) {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(str(raw.checkedAt)) ? str(raw.checkedAt) : today
    if (d !== place.checkedAt) item.patch.checked_at = d
  }
  return item
}
