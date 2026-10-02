import 'server-only'
import { createHash } from 'node:crypto'
import type { Session } from './session'
import { SUBMISSION_PHOTOS_BUCKET, db, isSupabaseConfigured } from './supabase'

export type NewPlacePayload = {
  name: string
  category: string
  mapsUrl?: string
  province: string
  district?: string
  note?: string
}
export type ReportPayload = { placeName: string; details: string }

export type Submission =
  { kind: 'new'; payload: NewPlacePayload } | { kind: 'report'; placeSlug?: string; payload: ReportPayload }

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'resolved'

export const statusLabel: Record<SubmissionStatus, string> = {
  pending: 'รอตรวจ',
  approved: 'ขึ้นเว็บแล้ว',
  resolved: 'แก้แล้ว',
  rejected: 'ไม่ผ่าน',
}

export type SubmissionRow = {
  id: string
  kind: 'new' | 'report'
  status: SubmissionStatus
  payload: NewPlacePayload & ReportPayload
  place_slug: string | null
  photos: string[]
  submitted_by_sub: string
  submitted_by_name: string
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  review_note: string | null
}

/** Storage folder for a user's submission photos; not reversible to the LINE ID. */
export function submissionFolder(sub: string) {
  return createHash('sha256').update(sub).digest('hex').slice(0, 24)
}

export async function saveSubmission(entry: Submission, photos: string[], by: Session): Promise<void> {
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === 'production') throw new Error('Supabase is not configured')
    console.info('[submission]', JSON.stringify({ ...entry, photos, by }))
    return
  }
  const { error } = await db()
    .from('submissions')
    .insert({
      kind: entry.kind,
      payload: entry.payload,
      place_slug: entry.kind === 'report' ? (entry.placeSlug ?? null) : null,
      photos,
      submitted_by_sub: by.sub,
      submitted_by_name: by.name,
    })
  if (error) throw error
}

export async function listSubmissions(
  status: SubmissionStatus | 'all' = 'pending',
): Promise<SubmissionRow[]> {
  if (!isSupabaseConfigured()) return []
  let q = db().from('submissions').select('*').order('created_at', { ascending: false }).limit(200)
  if (status !== 'all') q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return data as SubmissionRow[]
}

export async function getSubmission(id: string): Promise<SubmissionRow | undefined> {
  if (!isSupabaseConfigured()) return undefined
  const { data, error } = await db().from('submissions').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as SubmissionRow) ?? undefined
}

/** Short-lived URLs so admins can view private submission photos. */
export async function submissionPhotoUrls(paths: string[]): Promise<string[]> {
  if (!paths.length || !isSupabaseConfigured()) return []
  const { data, error } = await db()
    .storage.from(SUBMISSION_PHOTOS_BUCKET)
    .createSignedUrls(paths, 60 * 60)
  if (error) throw error
  return data.map((d) => d.signedUrl).filter((u): u is string => Boolean(u))
}
