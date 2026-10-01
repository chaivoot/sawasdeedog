'use server'

import { revalidatePath } from 'next/cache'
import { getPlace } from '@/lib/places'
import { ratingStats, setUserRating, userRating, type RatingStats } from '@/lib/ratings'
import { getSession } from '@/lib/session'
import { isSupabaseConfigured } from '@/lib/supabase'

export type MyRating = { enabled: boolean; loggedIn: boolean; stars?: number }

/** The signed-in user's own rating, loaded client-side so place pages stay cached. */
export async function getMyRating(slug: string): Promise<MyRating> {
  if (!isSupabaseConfigured()) return { enabled: false, loggedIn: false }
  const session = await getSession()
  if (!session) return { enabled: true, loggedIn: false }
  const place = await getPlace(slug)
  if (!place?.id) return { enabled: false, loggedIn: true }
  return { enabled: true, loggedIn: true, stars: await userRating(place.id, session.sub) }
}

export type RateResult =
  { ok: true; stars: number; stats?: RatingStats } | { ok: false; error: string; login?: boolean }

export async function rate(slug: string, stars: number): Promise<RateResult> {
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return { ok: false, error: 'เลือกได้ 1–5 ดาว' }
  if (!isSupabaseConfigured()) return { ok: false, error: 'ระบบให้คะแนนยังไม่เปิด' }
  const session = await getSession()
  if (!session) return { ok: false, error: 'เข้าสู่ระบบด้วย LINE ก่อนให้คะแนน', login: true }
  const place = await getPlace(slug)
  if (!place?.id) return { ok: false, error: 'ไม่พบสถานที่นี้' }

  try {
    await setUserRating(place.id, session.sub, stars)
  } catch (err) {
    console.error(err)
    return { ok: false, error: 'บันทึกคะแนนไม่สำเร็จ ลองใหม่อีกครั้ง' }
  }

  // Place and farm pages are cached; listings by area are rendered per request.
  revalidatePath(`/place/${slug}`)
  revalidatePath('/farm/[breed]', 'page')
  const stats = (await ratingStats([place.id])).get(place.id)
  return { ok: true, stars, stats }
}
