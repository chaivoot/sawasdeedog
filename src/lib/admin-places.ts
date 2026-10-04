import 'server-only'
import type { Place } from '@/data/places'
import { samplePlaces } from '@/data/places'
import { rowToPlace, type PlaceRow } from './places'
import { db, isSupabaseConfigured } from './supabase'

/** Every place, published or not, newest edits first (admin only). */
export async function listAllPlaces(search?: string): Promise<Place[]> {
  if (!isSupabaseConfigured()) return samplePlaces
  let q = db().from('places').select('*').order('updated_at', { ascending: false }).limit(500)
  const term = search?.trim().replace(/[%,()]/g, ' ')
  if (term) q = q.or(`name.ilike.%${term}%,slug.ilike.%${term}%`)
  const { data, error } = await q
  if (error) throw error
  return (data as PlaceRow[]).map(rowToPlace)
}

export async function getPlaceById(id: string): Promise<Place | undefined> {
  if (!isSupabaseConfigured()) return undefined
  const { data, error } = await db().from('places').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? rowToPlace(data as PlaceRow) : undefined
}

export async function slugTaken(slug: string, exceptId?: string): Promise<boolean> {
  let q = db().from('places').select('id').eq('slug', slug)
  if (exceptId) q = q.neq('id', exceptId)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).length > 0
}

export type PlaceInput = Omit<PlaceRow, 'id' | 'published'> & { published: boolean }

export async function upsertPlace(input: PlaceInput, id: string | undefined, by: string): Promise<string> {
  const row = { ...input, updated_by: by }
  const { data, error } = id
    ? await db().from('places').update(row).eq('id', id).select('id').single()
    : await db().from('places').insert(row).select('id').single()
  if (error) throw error
  return (data as { id: string }).id
}

/** How many other places are pinned in a category (admin limit check). */
export async function pinCount(category: string, exceptId?: string): Promise<number> {
  let q = db().from('places').select('id', { count: 'exact', head: true }).contains('pinned_in', [category])
  if (exceptId) q = q.neq('id', exceptId)
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}

export async function deletePlace(id: string): Promise<void> {
  const { error } = await db().from('places').delete().eq('id', id)
  if (error) throw error
}
