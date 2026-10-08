'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { deletePlace, getPlaceById, upsertPlace } from '@/lib/admin-places'
import { resolveMapsLatLng } from '@/lib/geo'
import { removePlacePhotos } from '@/lib/place-photos'
import { db, isSupabaseConfigured } from '@/lib/supabase'
import type { SubmissionStatus } from '@/lib/submissions'
import { readPlaceForm } from './place-form'

export type PlaceFormState = { errors?: Record<string, string>; message?: string }

function text(form: FormData, key: string) {
  const v = form.get(key)
  return typeof v === 'string' ? v.trim() : ''
}

export async function savePlaceAction(_prev: PlaceFormState, form: FormData): Promise<PlaceFormState> {
  const admin = await requireAdmin()
  if (!isSupabaseConfigured()) return { message: 'ยังไม่ได้ตั้งค่า Supabase (ดู README)' }

  const read = await readPlaceForm(form)
  if ('errors' in read) return { errors: read.errors }
  const { input, id, existing } = read
  const { slug, photos } = input

  try {
    await upsertPlace(input, id, admin.sub)
    const fromSubmission = text(form, 'fromSubmission')
    if (fromSubmission) await updateSubmission(fromSubmission, 'approved', admin.sub, slug)
  } catch (err) {
    console.error(err)
    return { message: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง' }
  }
  // Photos taken off this place: delete their files once the save has gone through.
  await removePlacePhotos((existing?.photos ?? []).filter((p) => !photos.includes(p)))

  revalidatePath('/', 'layout')
  redirect(`/admin/places?saved=${encodeURIComponent(slug)}`)
}

export async function deletePlaceAction(form: FormData) {
  await requireAdmin()
  const id = text(form, 'id')
  if (id) {
    const photos = (await getPlaceById(id))?.photos ?? []
    await deletePlace(id)
    await removePlacePhotos(photos)
  }
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
