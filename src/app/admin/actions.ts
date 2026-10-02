'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { extraCategoryOptions, getCategory, trainerStyles, type TrainerStyle } from '@/data/categories'
import { findArea } from '@/data/areas'
import { breeds } from '@/data/breeds'
import { requireAdmin } from '@/lib/admin'
import { deletePlace, slugTaken, upsertPlace, type PlaceInput } from '@/lib/admin-places'
import { cleanServiceAreas, parseLatLng, resolveMapsLatLng } from '@/lib/geo'
import { facebookUrl, instagramHandle, lineLink, websiteUrl } from '@/lib/contacts'
import { MAX_PLACE_PHOTOS } from '@/lib/limits'
import { db, isSupabaseConfigured } from '@/lib/supabase'
import type { SubmissionStatus } from '@/lib/submissions'

export type PlaceFormState = { errors?: Record<string, string>; message?: string }

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

export async function savePlaceAction(_prev: PlaceFormState, form: FormData): Promise<PlaceFormState> {
  const admin = await requireAdmin()
  if (!isSupabaseConfigured()) return { message: 'ยังไม่ได้ตั้งค่า Supabase (ดู README)' }

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

  const filterSlugs = new Set(allCategories.flatMap((c) => c.filters.map((f) => f.slug)))
  const attributes = form
    .getAll('attributes')
    .filter((a): a is string => typeof a === 'string' && filterSlugs.has(a))
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

  if (Object.keys(errors).length) return { errors }

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
    photos,
    breeds: placeBreeds,
    published: form.get('published') === 'on',
  }

  try {
    await upsertPlace(input, id, admin.sub)
    const fromSubmission = text(form, 'fromSubmission')
    if (fromSubmission) await updateSubmission(fromSubmission, 'approved', admin.sub, slug)
  } catch (err) {
    console.error(err)
    return { message: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง' }
  }

  revalidatePath('/', 'layout')
  redirect(`/admin/places?saved=${encodeURIComponent(slug)}`)
}

export async function deletePlaceAction(form: FormData) {
  await requireAdmin()
  const id = text(form, 'id')
  if (id) await deletePlace(id)
  revalidatePath('/', 'layout')
  redirect('/admin/places')
}

async function updateSubmission(
  id: string,
  status: SubmissionStatus,
  by: string,
  placeSlug?: string,
  note?: string,
) {
  const { error } = await db()
    .from('submissions')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: by,
      review_note: note ?? null,
      ...(placeSlug ? { place_slug: placeSlug } : {}),
    })
    .eq('id', id)
  if (error) throw error
}

export async function setSubmissionStatusAction(form: FormData) {
  const admin = await requireAdmin()
  const id = text(form, 'id')
  const status = text(form, 'status') as SubmissionStatus
  if (!id || !['pending', 'approved', 'rejected', 'resolved'].includes(status)) return
  await updateSubmission(id, status, admin.sub, undefined, text(form, 'note') || undefined)
  revalidatePath('/admin', 'layout')
  redirect('/admin')
}

/** Fills in storefront coordinates for places saved before they were read from the Maps link. */
export async function backfillCoordsAction() {
  await requireAdmin()
  if (!isSupabaseConfigured()) redirect('/admin/places')
  const { data, error } = await db()
    .from('places')
    .select('id, maps_url')
    .is('lat', null)
    .not('maps_url', 'is', null)
    .limit(40)
  if (error) throw error
  let found = 0
  const rows = (data ?? []) as { id: string; maps_url: string }[]
  for (const r of rows) {
    const c = await resolveMapsLatLng(r.maps_url)
    if (!c) continue
    const { error: e } = await db().from('places').update({ lat: c.lat, lng: c.lng }).eq('id', r.id)
    if (!e) found++
  }
  revalidatePath('/', 'layout')
  redirect(`/admin/places?coords=${found}-${rows.length}`)
}
