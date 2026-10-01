import 'server-only'
import { db, isSupabaseConfigured } from './supabase'

export type RatingStats = { count: number; avg: number }

type StatsRow = { place_id: string; rating_count: number; rating_avg: number }

/** Rating stats keyed by place id; places without ratings are absent. */
export async function ratingStats(placeIds: string[]): Promise<Map<string, RatingStats>> {
  const map = new Map<string, RatingStats>()
  if (!isSupabaseConfigured() || placeIds.length === 0) return map
  const { data, error } = await db()
    .from('place_rating_stats')
    .select('place_id, rating_count, rating_avg')
    .in('place_id', placeIds)
  if (error) throw error
  for (const r of data as StatsRow[]) map.set(r.place_id, { count: r.rating_count, avg: r.rating_avg })
  return map
}

export async function userRating(placeId: string, sub: string): Promise<number | undefined> {
  const { data, error } = await db()
    .from('place_ratings')
    .select('stars')
    .eq('place_id', placeId)
    .eq('user_sub', sub)
    .maybeSingle()
  if (error) throw error
  return (data as { stars: number } | null)?.stars
}

/** Insert or change this user's rating; the primary key keeps it to one per user. */
export async function setUserRating(placeId: string, sub: string, stars: number): Promise<void> {
  const { error } = await db()
    .from('place_ratings')
    .upsert({ place_id: placeId, user_sub: sub, stars }, { onConflict: 'place_id,user_sub' })
  if (error) throw error
}
