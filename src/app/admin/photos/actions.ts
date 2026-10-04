'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { deleteOrphans, makeMissingThumbs, photoReport } from '@/lib/place-photos'
import { isSupabaseConfigured } from '@/lib/supabase'

/** Photos per click, so one request stays well inside the function time limit. */
const THUMB_BATCH = 30

export async function makeThumbsAction() {
  await requireAdmin()
  if (!isSupabaseConfigured()) redirect('/admin/photos')
  const { missingThumbs } = await photoReport()
  const made = await makeMissingThumbs(missingThumbs, THUMB_BATCH)
  revalidatePath('/', 'layout')
  redirect(`/admin/photos?thumbs=${made}`)
}

export async function deleteOrphansAction() {
  await requireAdmin()
  if (!isSupabaseConfigured()) redirect('/admin/photos')
  const deleted = await deleteOrphans()
  redirect(`/admin/photos?deleted=${deleted}`)
}
