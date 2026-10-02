'use server'

import { redirect } from 'next/navigation'
import { categories } from '@/data/categories'
import { findArea } from '@/data/areas'
import { getPlace } from '@/lib/places'
import { MAX_PHOTOS } from '@/lib/limits'
import { getSession } from '@/lib/session'
import { saveSubmission, submissionFolder, type Submission } from '@/lib/submissions'

export type FormState = {
  errors?: Record<string, string>
  message?: string
}

const GOOGLE_MAPS_HOSTS = [
  'maps.app.goo.gl',
  'goo.gl',
  'maps.google.com',
  'www.google.com',
  'google.com',
  'g.co',
]

function isGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
    if (url.hostname === 'www.google.com' || url.hostname === 'google.com')
      return url.pathname.startsWith('/maps')
    if (url.hostname === 'goo.gl') return url.pathname.startsWith('/maps')
    return GOOGLE_MAPS_HOSTS.includes(url.hostname) || /^maps\.google\.[a-z.]+$/.test(url.hostname)
  } catch {
    return false
  }
}

function text(form: FormData, key: string) {
  const v = form.get(key)
  return typeof v === 'string' ? v.trim() : ''
}

export async function submitAction(_prev: FormState, form: FormData): Promise<FormState> {
  const session = await getSession()
  if (!session) return { message: 'กรุณาเข้าสู่ระบบด้วย LINE อีกครั้ง' }

  const errors: Record<string, string> = {}
  const kind = text(form, 'kind') === 'report' ? 'report' : 'new'
  let submission: Submission

  if (kind === 'new') {
    const name = text(form, 'name')
    const category = text(form, 'category')
    const mapsUrl = text(form, 'mapsUrl')
    const province = text(form, 'province')
    const district = text(form, 'district')
    if (!name) errors.name = 'กรอกชื่อสถานที่'
    if (!categories.some((c) => c.slug === category)) errors.category = 'เลือกหมวด'
    if (mapsUrl && !isGoogleMapsUrl(mapsUrl)) errors.mapsUrl = 'ลิงก์นี้ไม่ใช่ลิงก์ Google Maps'
    if (!findArea(province)) errors.province = 'เลือกจังหวัด'
    else if (district && !findArea(province, district)) errors.district = 'เลือกเขตใหม่'
    submission = {
      kind,
      payload: {
        name,
        category,
        mapsUrl: mapsUrl || undefined,
        province,
        district: district || undefined,
        note: text(form, 'note') || undefined,
      },
    }
  } else {
    const placeSlug = text(form, 'place')
    const place = placeSlug ? await getPlace(placeSlug) : undefined
    const placeName = place?.name ?? text(form, 'placeName')
    const details = text(form, 'details')
    if (!placeName) errors.placeName = 'กรอกชื่อสถานที่'
    if (!details) errors.details = 'บอกทีมว่าข้อมูลไหนไม่ตรง'
    submission = { kind, placeSlug: place?.slug, payload: { placeName, details } }
  }

  // Photos were uploaded straight to storage; only their paths come through here.
  let photos: string[] = []
  try {
    photos = JSON.parse(text(form, 'photoPaths') || '[]')
  } catch {
    photos = []
  }
  const folder = `${submissionFolder(session.sub)}/`
  if (!Array.isArray(photos) || photos.length > MAX_PHOTOS) errors.photos = `แนบได้สูงสุด ${MAX_PHOTOS} รูป`
  else if (photos.some((p) => typeof p !== 'string' || !p.startsWith(folder) || p.includes('..')))
    errors.photos = 'รูปที่แนบไม่ถูกต้อง ลองแนบใหม่'

  if (Object.keys(errors).length) return { errors }

  try {
    await saveSubmission(submission, photos, session)
  } catch (err) {
    console.error(err)
    return { message: 'ส่งไม่สำเร็จ ลองใหม่อีกครั้ง หรือติดต่อทีมทาง LINE' }
  }

  const sentName = submission.kind === 'new' ? submission.payload.name : submission.payload.placeName
  redirect(`/submit?sent=${encodeURIComponent(sentName)}&kind=${kind}`)
}
