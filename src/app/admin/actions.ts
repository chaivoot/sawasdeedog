'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCategory, trainerStyles, type TrainerStyle } from '@/data/categories'
import { findArea } from '@/data/areas'
import { breeds } from '@/data/breeds'
import { requireAdmin } from '@/lib/admin'
import { deletePlace, slugTaken, upsertPlace, type PlaceInput } from '@/lib/admin-places'
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
  const isTrainer = category?.slug === 'trainer'

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

  const mapsUrl = text(form, 'mapsUrl')
  if (!isHttpUrl(mapsUrl)) errors.mapsUrl = 'ใส่ลิงก์ Google Maps'

  for (const key of ['facebook', 'website']) {
    const v = text(form, key)
    if (v && !isHttpUrl(v)) errors[key] = 'ต้องเป็นลิงก์ที่ขึ้นต้นด้วย https://'
  }

  const filterSlugs = new Set(category?.filters.map((f) => f.slug))
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
    line: optional(form, 'line'),
    instagram: optional(form, 'instagram'),
    facebook: optional(form, 'facebook'),
    website: optional(form, 'website'),
    maps_url: mapsUrl,
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
