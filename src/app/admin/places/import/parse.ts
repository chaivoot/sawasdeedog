import { extraTypeOptions, getCategory, trainerStyles } from '@/data/categories'
import { provinces } from '@/data/areas'
import { breeds } from '@/data/breeds'
import { STAY_MIN_DOG_KG } from '@/data/criteria'
import { isAgodaUrl } from '@/lib/agoda'
import { cleanServiceAreas, parseLatLng } from '@/lib/geo'
import type { PlaceDraft } from '../PlaceEditor'
import { isUpdate } from './patch'

// Turns pasted research (JSON: one place or a list) into editor drafts. Nothing
// is saved here: each draft opens in the normal editor to be checked first.

export type ImportItem = {
  draft: PlaceDraft
  /** Things to check before publishing, from the research. */
  notes: string[]
  sources: string[]
  /** Fields that were given but could not be used. */
  warnings: string[]
}

const norm = (s: string) =>
  s
    .replace(/\s+/g, '')
    .replace(/^(จังหวัด|อำเภอ|กิ่งอำเภอ|เขต)/, '')
    .toLowerCase()

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '')
const strs = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : str(v) ? [str(v)] : [])

function findProvince(v: string) {
  const n = norm(v)
  if (!n) return undefined
  if (n === 'กรุงเทพมหานคร' || n === 'กทม') return provinces.find((p) => p.slug === 'bangkok')
  return provinces.find((p) => p.slug === v.toLowerCase() || norm(p.name) === n)
}

function findDistrict(province: (typeof provinces)[number], v: string) {
  return province.districts.find((d) => d.slug === v.toLowerCase() || norm(d.name) === norm(v))
}

/**
 * Service areas as area tokens ("bangkok", "bangkok/lat-krabang"). Research may give
 * Thai names instead ("กรุงเทพมหานคร", "กรุงเทพมหานคร/เขตลาดกระบัง"); both work.
 */
function serviceAreaTokens(values: string[], warnings: string[]): string[] {
  const tokens: string[] = []
  for (const v of values) {
    const [p, d] = v.split('/').map((x) => x.trim())
    const province = findProvince(p)
    const district = province && d ? findDistrict(province, d) : undefined
    if (!province || (d && !district)) warnings.push(`ไม่รู้จักพื้นที่ให้บริการ "${v}"`)
    else tokens.push(district ? `${province.slug}/${district.slug}` : province.slug)
  }
  return cleanServiceAreas(tokens)
}

function toItem(raw: Record<string, unknown>, today: string): ImportItem {
  const warnings: string[] = []
  const name = str(raw.name)
  if (!name) warnings.push('ไม่มีชื่อ')

  const category = getCategory(str(raw.category))
  if (str(raw.category) && !category) warnings.push(`ไม่รู้จักหมวด "${str(raw.category)}"`)

  const type = str(raw.type)
  const validType = category?.types?.some((t) => t.slug === type) ? type : undefined
  if (type && !validType) warnings.push(`ประเภท "${type}" ไม่ตรงกับหมวด`)

  if (str(raw.agodaUrl) && !isAgodaUrl(str(raw.agodaUrl)))
    warnings.push('ลิงก์ Agoda ไม่ใช่หน้า agoda.com (ไม่ได้ใส่)')
  const extraCategories = strs(raw.extraCategories).filter((c) => getCategory(c) && c !== category?.slug)
  const trainerStyle = str(raw.trainerStyle)

  const province = findProvince(str(raw.province))
  if (!province) warnings.push(`ไม่รู้จักจังหวัด "${str(raw.province)}"`)
  const districtRaw = str(raw.district)
  const district = province && districtRaw ? findDistrict(province, districtRaw) : undefined
  if (districtRaw && !district) warnings.push(`ไม่รู้จักเขต/อำเภอ "${districtRaw}"`)

  const coords = parseLatLng(str(raw.coords))
  if (str(raw.coords) && !coords) warnings.push('พิกัดไม่ถูกต้อง')

  const filterSlugs = new Set(
    [category, ...extraCategories.map((c) => getCategory(c))].flatMap((c) =>
      [
        ...(c?.filters ?? []),
        ...(c?.warnings ?? []),
        ...(c && c !== category ? extraTypeOptions(c) : []),
      ].map((f) => f.slug),
    ),
  )
  const maxDogKg = Number(raw.maxDogKg)
  if (raw.maxDogKg != null && !(Number.isInteger(maxDogKg) && maxDogKg > 0))
    warnings.push(`น้ำหนักสูงสุด "${str(raw.maxDogKg)}" ไม่ใช่ตัวเลข`)
  else if ([category?.slug, ...extraCategories].includes('stay') && maxDogKg < STAY_MIN_DOG_KG)
    warnings.push(`รับน้องหมาแค่ ${maxDogKg} กก. ไม่ผ่านเกณฑ์ที่พัก`)
  const attributes = strs(raw.attributes)
  for (const a of attributes) if (!filterSlugs.has(a)) warnings.push(`ไม่รู้จักเกณฑ์ "${a}"`)

  const breedSlugs = new Set(breeds.map((b) => b.slug))
  const placeBreeds = strs(raw.breeds)
  for (const b of placeBreeds) if (!breedSlugs.has(b)) warnings.push(`ไม่รู้จักสายพันธุ์ "${b}"`)

  const checkedAt = /^\d{4}-\d{2}-\d{2}$/.test(str(raw.checkedAt)) ? str(raw.checkedAt) : today

  return {
    draft: {
      name,
      slug: str(raw.slug).toLowerCase(),
      category: category?.slug ?? '',
      extraCategories,
      type: validType,
      trainerStyle: trainerStyles.some((s) => s.slug === trainerStyle) ? trainerStyle : undefined,
      province: province?.slug ?? 'bangkok',
      district: district?.slug ?? '',
      checkedAt,
      description: str(raw.description) || undefined,
      attributes: attributes.filter((a) => filterSlugs.has(a)),
      hours: str(raw.hours) || undefined,
      price: str(raw.price) || undefined,
      contacts: {
        phone: str(raw.phone) || undefined,
        line: str(raw.line) || undefined,
        instagram: str(raw.instagram) || undefined,
        facebook: str(raw.facebook) || undefined,
        website: str(raw.website) || undefined,
      },
      mapsUrl: str(raw.mapsUrl),
      serviceAreas: serviceAreaTokens(strs(raw.serviceAreas), warnings),
      coords: coords ? `${coords.lat}, ${coords.lng}` : '',
      // Photos are uploaded in the editor: hotlinked images break, and may not be ours to use.
      photos: [],
      breeds: placeBreeds.filter((b) => breedSlugs.has(b)),
      maxDogKg: Number.isInteger(maxDogKg) && maxDogKg > 0 ? String(maxDogKg) : '',
      maxDogs: Number.isInteger(Number(raw.maxDogs)) && Number(raw.maxDogs) > 0 ? String(raw.maxDogs) : '',
      agodaUrl: isAgodaUrl(str(raw.agodaUrl)) ? str(raw.agodaUrl) : '',
      petFee: str(raw.petFee) || undefined,
      // Shown by default; research can say "published": false to keep one hidden.
      published: raw.published !== false,
      pinnedIn: [],
    },
    notes: strs(raw.notes),
    sources: strs(raw.sources).filter((s) => /^https?:\/\//.test(s)),
    warnings,
  }
}

export type ParsedImport = {
  items: ImportItem[]
  /** Raw entries marked "update": true, for places already listed (see patch.ts). */
  updates: Record<string, unknown>[]
}

export function parseImport(text: string, today: string): ParsedImport | { error: string } {
  const trimmed = text
    .trim()
    // Tolerate a fenced code block copied from chat.
    .replace(/^```(?:json)?\s*/, '')
    .replace(/\s*```$/, '')
  if (!trimmed) return { error: 'วางข้อมูลก่อน' }
  let data: unknown
  try {
    data = JSON.parse(trimmed)
  } catch {
    return { error: 'อ่านข้อมูลไม่ได้ ต้องเป็น JSON (วางทั้งก้อนตามที่ได้มา)' }
  }
  const list = Array.isArray(data) ? data : [data]
  if (!list.length || list.some((x) => !x || typeof x !== 'object' || Array.isArray(x)))
    return { error: 'รูปแบบไม่ถูกต้อง ต้องเป็นข้อมูลร้าน 1 ร้าน หรือรายการของหลายร้าน' }
  const raws = list as Record<string, unknown>[]
  return {
    items: raws.filter((x) => !isUpdate(x)).map((x) => toItem(x, today)),
    updates: raws.filter(isUpdate),
  }
}

export type ExistingPlace = { id?: string; slug: string; name: string }

/** Comparable form of a name: "People & Tail" and "people and tail" match. */
const nameKey = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^\p{L}\p{N}]+/gu, '')

/** A listed place this draft probably duplicates, by slug or name. */
export function findExisting(draft: PlaceDraft, existing: ExistingPlace[]): ExistingPlace | undefined {
  const key = nameKey(draft.name)
  return existing.find(
    (e) =>
      (draft.slug && e.slug === draft.slug) ||
      (key.length >= 4 &&
        (nameKey(e.name) === key ||
          (key.length >= 6 && (nameKey(e.name).includes(key) || key.includes(nameKey(e.name)))))),
  )
}
