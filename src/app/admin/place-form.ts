import 'server-only'
import { randomBytes } from 'node:crypto'
import {
  extraCategoryOptions,
  extraTypeOptions,
  getCategory,
  trainerStyles,
  type TrainerStyle,
} from '@/data/categories'
import { findArea } from '@/data/areas'
import { breeds } from '@/data/breeds'
import { STAY_MIN_DOG_KG, takesWeightLimit } from '@/data/criteria'
import type { Place } from '@/data/places'
import { getPlaceById, pinCount, slugTaken, type PlaceInput } from '@/lib/admin-places'
import { cleanServiceAreas, parseLatLng, resolveMapsLatLng } from '@/lib/geo'
import { isAgodaUrl } from '@/lib/agoda'
import { facebookUrl, instagramHandle, lineLink, websiteUrl } from '@/lib/contacts'
import { MAX_PINS, MAX_PLACE_PHOTOS } from '@/lib/limits'
import type { PlaceDraft } from './places/PlaceEditor'

// Reads the place editor's fields into a row, with the same checks for the editor
// and for saving many imported drafts at once.

export type ReadPlace =
  { errors: Record<string, string> } | { input: PlaceInput; id?: string; existing?: Place }

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

function text(form: FormData, key: string) {
  const v = form.get(key)
  return typeof v === 'string' ? v.trim() : ''
}

function optional(form: FormData, key: string) {
  return text(form, key) || null
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isHttpUrl(v: string) {
  try {
    const u = new URL(v)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

export async function readPlaceForm(form: FormData): Promise<ReadPlace> {
  const id = text(form, 'id') || undefined
  const errors: Record<string, string> = {}

  const name = text(form, 'name')
  if (!name) errors.name = 'กรอกชื่อ'

  const category = getCategory(text(form, 'category'))
  if (!category) errors.category = 'เลือกหมวด'
  const isFarm = category?.slug === 'farm'
  const extraSlugs = new Set(extraCategoryOptions(category?.slug ?? '').map((c) => c.slug))
  const extraCategories = form
    .getAll('extraCategories')
    .filter((c): c is string => typeof c === 'string' && extraSlugs.has(c))
  const allCategories = [category, ...extraCategories.map((c) => getCategory(c))].filter((c) => !!c)
  const isTrainer = allCategories.some((c) => c.slug === 'trainer')

  const type = text(form, 'type')
  if (type && !category?.types?.some((t) => t.slug === type)) errors.type = 'ประเภทไม่ตรงกับหมวด'

  const trainerStyle = text(form, 'trainerStyle') as TrainerStyle | ''
  if (isTrainer && !trainerStyles.some((s) => s.slug === trainerStyle))
    errors.trainerStyle = 'เลือก Force-Free หรือ Balance'

  const province = text(form, 'province')
  const district = text(form, 'district')
  if (!findArea(province)) errors.province = 'เลือกจังหวัด'
  else if (district && !findArea(province, district)) errors.district = 'เขตไม่ตรงกับจังหวัด'

  const checkedAt = text(form, 'checkedAt')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)) errors.checkedAt = 'ใส่วันที่เช็ค'

  // Google Maps only for places with a storefront; visiting services list service areas instead.
  const mapsUrl = text(form, 'mapsUrl')
  if (mapsUrl && !isHttpUrl(mapsUrl)) errors.mapsUrl = 'ลิงก์ Google Maps ไม่ถูกต้อง'
  const serviceAreas = cleanServiceAreas(
    form.getAll('serviceAreas').filter((v): v is string => typeof v === 'string'),
  )

  // Coordinates: typed by hand, or read from the Maps link. A prefilled value is
  // re-read when the link changed, so an edited link never keeps old coordinates.
  const coordsText = text(form, 'coords')
  let coords = parseLatLng(coordsText)
  if (coordsText && !coords) errors.coords = 'ใส่เป็น ละติจูด, ลองจิจูด เช่น 13.7279, 100.7782'
  const linkChanged = mapsUrl !== text(form, 'coordsFrom')
  const coordsUntouched = coordsText === text(form, 'coordsWere')
  if (mapsUrl && !errors.mapsUrl && (!coords || (linkChanged && coordsUntouched))) {
    coords = (await resolveMapsLatLng(mapsUrl)) ?? (linkChanged && coordsUntouched ? undefined : coords)
  }
  if (!mapsUrl && coordsUntouched && text(form, 'coordsFrom')) coords = undefined

  // Store contacts in one canonical form, whatever was pasted.
  const instagramRaw = text(form, 'instagram')
  const instagram = instagramHandle(instagramRaw)
  if (instagramRaw && !instagram) errors.instagram = 'ใส่ชื่อบัญชี หรือลิงก์ instagram.com'
  const facebookRaw = text(form, 'facebook')
  const facebook = facebookUrl(facebookRaw)
  if (facebookRaw && !facebook) errors.facebook = 'ใส่ชื่อเพจ หรือลิงก์ facebook.com'
  const lineRaw = text(form, 'line')
  if (lineRaw && !lineLink(lineRaw)) errors.line = 'ใส่ LINE ID หรือลิงก์ line.me'
  const websiteRaw = text(form, 'website')
  const website = websiteUrl(websiteRaw)
  if (websiteRaw && !website) errors.website = 'ลิงก์เว็บไซต์ไม่ถูกต้อง'

  const filterSlugs = new Set(
    allCategories.flatMap((c) =>
      [...c.filters, ...(c.warnings ?? []), ...(c === category ? [] : extraTypeOptions(c))].map(
        (f) => f.slug,
      ),
    ),
  )
  // A warning shared by two categories is ticked in both groups; keep it once.
  const attributes = [
    ...new Set(
      form.getAll('attributes').filter((a): a is string => typeof a === 'string' && filterSlugs.has(a)),
    ),
  ]

  // Stays and dog services: the heaviest dog taken (empty = no limit); a stay below the listing minimum is an error.
  const isStay = allCategories.some((c) => c.slug === 'stay')
  const hasWeightLimit = allCategories.some((c) => takesWeightLimit(c.slug))
  const maxDogKgText = hasWeightLimit ? text(form, 'maxDogKg') : ''
  const maxDogKg = maxDogKgText ? Number(maxDogKgText) : null
  if (maxDogKg !== null && (!Number.isInteger(maxDogKg) || maxDogKg <= 0))
    errors.maxDogKg = 'ใส่เป็นตัวเลขกิโลกรัม เช่น 25'
  else if (isStay && maxDogKg !== null && maxDogKg < STAY_MIN_DOG_KG)
    errors.maxDogKg = `รับน้องหมาไม่ถึง ${STAY_MIN_DOG_KG} กก. ไม่ผ่านเกณฑ์ที่พัก`
  const maxDogsText = isStay ? text(form, 'maxDogs') : ''
  const maxDogs = maxDogsText ? Number(maxDogsText) : null
  if (maxDogs !== null && (!Number.isInteger(maxDogs) || maxDogs <= 0))
    errors.maxDogs = 'ใส่เป็นจำนวนตัว เช่น 2'
  const agodaUrl = isStay ? text(form, 'agodaUrl') : ''
  if (agodaUrl && !isAgodaUrl(agodaUrl)) errors.agodaUrl = 'ใส่ลิงก์หน้าที่พักจาก agoda.com'
  const petFee = isStay ? text(form, 'petFee') : ''
  const breedSlugs = new Set(breeds.map((b) => b.slug))
  const placeBreeds = isFarm
    ? form.getAll('breeds').filter((b): b is string => typeof b === 'string' && breedSlugs.has(b))
    : []
  if (isFarm && placeBreeds.length === 0) errors.breeds = 'เลือกอย่างน้อย 1 สายพันธุ์'

  let photos: string[] = []
  try {
    photos = JSON.parse(text(form, 'photos') || '[]')
  } catch {
    photos = []
  }
  if (!Array.isArray(photos) || photos.some((p) => typeof p !== 'string' || !isHttpUrl(p)))
    errors.photos = 'รายการรูปไม่ถูกต้อง'
  else if (photos.length > MAX_PLACE_PHOTOS) errors.photos = `ใส่รูปได้สูงสุด ${MAX_PLACE_PHOTOS} รูป`

  let slug = text(form, 'slug').toLowerCase()
  if (!slug) slug = slugify(name) || `${category?.slug ?? 'place'}-${randomBytes(3).toString('hex')}`
  if (!SLUG_RE.test(slug)) errors.slug = 'ใช้ได้เฉพาะ a-z 0-9 และขีด (-)'
  else if (await slugTaken(slug, id)) errors.slug = 'slug นี้มีรายการอื่นใช้แล้ว'

  // Pins only count in categories the place is listed in, and each category holds MAX_PINS.
  const pinnedIn = form
    .getAll('pinnedIn')
    .filter((c): c is string => typeof c === 'string' && allCategories.some((x) => x.slug === c))
  for (const c of pinnedIn) {
    if ((await pinCount(c, id)) >= MAX_PINS) {
      errors.pinnedIn = `หมวด${getCategory(c)?.name}ปักหมุดครบ ${MAX_PINS} รายการแล้ว เอาหมุดรายการอื่นออกก่อน`
      break
    }
  }

  if (Object.keys(errors).length) return { errors }

  // A newly added pin moves the place to the top of the pinned ones; unchanged pins keep their time.
  const existing = id ? await getPlaceById(id) : undefined
  const before = existing?.pinnedIn ?? []
  const pinTime = !pinnedIn.length
    ? { pinned_at: null }
    : pinnedIn.some((c) => !before.includes(c))
      ? { pinned_at: new Date().toISOString() }
      : {}

  const input: PlaceInput = {
    slug,
    name,
    category: category!.slug,
    extra_categories: extraCategories,
    type: type || null,
    trainer_style: isTrainer ? (trainerStyle as TrainerStyle) : null,
    province,
    district: district || null,
    checked_at: checkedAt,
    description: optional(form, 'description'),
    attributes,
    hours: optional(form, 'hours'),
    price: optional(form, 'price'),
    phone: optional(form, 'phone'),
    line: lineRaw || null,
    instagram: instagram ?? null,
    facebook: facebook ?? null,
    website: website ?? null,
    maps_url: mapsUrl || null,
    service_areas: serviceAreas,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    max_dog_kg: maxDogKg,
    max_dogs: maxDogs,
    agoda_url: agodaUrl || null,
    pet_fee: petFee || null,
    photos,
    breeds: placeBreeds,
    published: form.get('published') === 'on',
    pinned_in: pinnedIn,
    ...pinTime,
  }

  return { input, id, existing }
}

/** The form an untouched editor would send for this draft. */
export function draftToForm(draft: PlaceDraft): FormData {
  const f = new FormData()
  const set = (k: string, v: string | undefined) => f.set(k, v ?? '')
  const add = (k: string, vs: string[]) => vs.forEach((v) => f.append(k, v))
  if (draft.id) set('id', draft.id)
  set('name', draft.name)
  set('slug', draft.slug)
  set('category', draft.category)
  add('extraCategories', draft.extraCategories)
  set('type', draft.type)
  set('trainerStyle', draft.trainerStyle)
  set('province', draft.province)
  set('district', draft.district)
  set('checkedAt', draft.checkedAt)
  set('description', draft.description)
  add('attributes', draft.attributes)
  set('hours', draft.hours)
  set('price', draft.price)
  set('phone', draft.contacts.phone)
  set('line', draft.contacts.line)
  set('instagram', draft.contacts.instagram)
  set('facebook', draft.contacts.facebook)
  set('website', draft.contacts.website)
  set('mapsUrl', draft.mapsUrl)
  set('coordsFrom', draft.mapsUrl)
  set('coordsWere', draft.coords)
  set('coords', draft.coords)
  add('serviceAreas', draft.serviceAreas)
  set('photos', JSON.stringify(draft.photos))
  add('breeds', draft.breeds)
  set('maxDogKg', draft.maxDogKg)
  set('maxDogs', draft.maxDogs)
  set('agodaUrl', draft.agodaUrl)
  set('petFee', draft.petFee)
  if (draft.published) set('published', 'on')
  add('pinnedIn', draft.pinnedIn)
  return f
}
