'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { listAllPlaces } from '@/lib/admin-places'
import { todayInBangkok } from '@/lib/format'
import { db, isSupabaseConfigured } from '@/lib/supabase'
import { parseImport } from './parse'
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
