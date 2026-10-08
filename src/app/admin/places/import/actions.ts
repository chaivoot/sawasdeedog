'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { listAllPlaces, upsertPlace } from '@/lib/admin-places'
import { todayInBangkok } from '@/lib/format'
import { db, isSupabaseConfigured } from '@/lib/supabase'
import { draftToForm, readPlaceForm } from '../../place-form'
import { findExisting, parseImport, type ExistingPlace } from './parse'
import { toPatch } from './patch'

export type UpdateState = { updated?: number; failed?: string[]; message?: string }

/** Saves every "update": true entry that changes something; the patches are re-read here, not trusted from the page. */
export async function applyUpdatesAction(_prev: UpdateState, form: FormData): Promise<UpdateState> {
  const admin = await requireAdmin()
  if (!isSupabaseConfigured()) return { message: 'ยังไม่ได้ตั้งค่า Supabase' }
  const text = form.get('text')
  const parsed = parseImport(typeof text === 'string' ? text : '', todayInBangkok())
  if ('error' in parsed) return { message: parsed.error }

  const existing = await listAllPlaces()
  const items = parsed.updates
    .map((raw) => toPatch(raw, existing, todayInBangkok()))
    .filter((it) => it.id && it.changes.length)
  let updated = 0
  const failed: string[] = []
  for (const it of items) {
    const { error } = await db()
      .from('places')
      .update({ ...it.patch, updated_by: admin.sub })
      .eq('id', it.id!)
    if (error) {
      console.error(error)
      failed.push(it.name)
    } else updated++
  }
  revalidatePath('/', 'layout')
  return { updated, failed }
}

export type SaveAllState = {
  saved?: string[]
  skipped?: string[]
  failed?: { name: string; reason: string }[]
  message?: string
}

/**
 * Saves every new place in the pasted list as it stands, with the editor's checks.
 * Places already listed (same slug or name) are skipped; the list is re-read here.
 */
export async function saveAllNewAction(_prev: SaveAllState, form: FormData): Promise<SaveAllState> {
  const admin = await requireAdmin()
  if (!isSupabaseConfigured()) return { message: 'ยังไม่ได้ตั้งค่า Supabase' }
  const text = form.get('text')
  const parsed = parseImport(typeof text === 'string' ? text : '', todayInBangkok())
  if ('error' in parsed) return { message: parsed.error }

  const existing: ExistingPlace[] = await listAllPlaces()
  const saved: string[] = []
  const skipped: string[] = []
  const failed: { name: string; reason: string }[] = []
  for (const { draft } of parsed.items) {
    if (findExisting(draft, existing)) {
      skipped.push(draft.name)
      continue
    }
    const read = await readPlaceForm(draftToForm(draft))
    if ('errors' in read) {
      failed.push({ name: draft.name || '(ไม่มีชื่อ)', reason: Object.values(read.errors).join(' · ') })
      continue
    }
    try {
      await upsertPlace(read.input, undefined, admin.sub)
      saved.push(draft.name)
      existing.push({ name: read.input.name, slug: read.input.slug })
    } catch (err) {
      console.error(err)
      failed.push({ name: draft.name, reason: 'บันทึกไม่สำเร็จ' })
    }
  }
  if (saved.length) revalidatePath('/', 'layout')
  return { saved, skipped, failed }
}
