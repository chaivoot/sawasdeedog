'use server'

import { randomUUID } from 'node:crypto'
import { isAdmin } from '@/lib/admin'
import { MAX_PHOTO_MB, MAX_PHOTOS, MAX_PLACE_PHOTOS, PHOTO_TYPES } from '@/lib/limits'
import { getSession } from '@/lib/session'
import { submissionFolder } from '@/lib/submissions'
import { PLACE_PHOTOS_BUCKET, SUBMISSION_PHOTOS_BUCKET, db, isSupabaseConfigured } from '@/lib/supabase'

export type UploadTarget = { path: string; signedUrl: string; publicUrl?: string }
export type UploadTargets = { ok: true; targets: UploadTarget[] | null } | { ok: false; error: string }

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

/**
 * Signed URLs the browser uploads photos to directly, so files never pass
 * through our server (Vercel caps request bodies at ~4.5MB).
 * Returns targets: null when Supabase isn't configured (local dev).
 */
export async function createUploadTargets(
  purpose: 'submission' | 'place',
  files: { type: string; size: number }[],
): Promise<UploadTargets> {
  const session = await getSession()
  if (!session) return { ok: false, error: 'กรุณาเข้าสู่ระบบด้วย LINE อีกครั้ง' }
  if (purpose === 'place' && !isAdmin(session)) return { ok: false, error: 'ไม่มีสิทธิ์' }

  const max = purpose === 'place' ? MAX_PLACE_PHOTOS : MAX_PHOTOS
  if (files.length === 0 || files.length > max) return { ok: false, error: `แนบได้สูงสุด ${max} รูป` }
  if (files.some((f) => !PHOTO_TYPES.includes(f.type)))
    return { ok: false, error: 'แนบได้เฉพาะรูป JPG, PNG หรือ WebP' }
  if (files.some((f) => f.size > MAX_PHOTO_MB * 1024 * 1024))
    return { ok: false, error: `รูปต้องไม่เกิน ${MAX_PHOTO_MB}MB ต่อรูป` }

  if (!isSupabaseConfigured()) return { ok: true, targets: null }

  const bucket = purpose === 'place' ? PLACE_PHOTOS_BUCKET : SUBMISSION_PHOTOS_BUCKET
  const folder = purpose === 'place' ? new Date().toISOString().slice(0, 7) : submissionFolder(session.sub)
  const storage = db().storage.from(bucket)

  const targets: UploadTarget[] = []
  for (const f of files) {
    const path = `${folder}/${randomUUID()}.${EXT[f.type]}`
    const { data, error } = await storage.createSignedUploadUrl(path)
    if (error) {
      console.error(error)
      return { ok: false, error: 'เตรียมอัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง' }
    }
    targets.push({
      path,
      signedUrl: data.signedUrl,
      publicUrl: purpose === 'place' ? storage.getPublicUrl(path).data.publicUrl : undefined,
    })
  }
  return { ok: true, targets }
}
