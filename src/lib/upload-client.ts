import { createUploadTargets } from '@/app/actions/uploads'
import { PHOTO_TYPES } from '@/lib/limits'
import { THUMB_EDGE } from '@/lib/photo-urls'

const MAX_EDGE = 1600

/** One photo ready to upload; place photos also carry the card-sized copy. */
type Prepared = { full: Blob; thumb?: Blob }

/** Draws the bitmap at most `edge` px on the long side: WebP, or JPEG where the browser can't write WebP. */
async function encode(bitmap: ImageBitmap, edge: number, type?: string): Promise<Blob | null> {
  const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const as = (t: string, q: number) => new Promise<Blob | null>((r) => canvas.toBlob(r, t, q))
  if (type) return as(type, 0.8)
  // Older Safari returns PNG when asked for WebP; fall back to JPEG then.
  const webp = await as('image/webp', 0.8)
  return webp?.type === 'image/webp' ? webp : as('image/jpeg', 0.82)
}

/** Re-encodes every photo (even small ones, screenshots are often large PNGs); adds a card copy when asked. */
async function prepare(file: File, withThumb: boolean): Promise<Prepared> {
  try {
    const bitmap = await createImageBitmap(file)
    try {
      const full = await encode(bitmap, MAX_EDGE)
      if (!full) return { full: file }
      // The copy uses the same format, so its name differs only by ".sm".
      const thumb = withThumb ? ((await encode(bitmap, THUMB_EDGE, full.type)) ?? undefined) : undefined
      // A tiny original can beat the re-encode; keep it then (without a copy, cards fall back to it).
      if (full.size >= file.size && PHOTO_TYPES.includes(file.type)) return { full: file }
      return { full, thumb }
    } finally {
      bitmap.close()
    }
  } catch {
    // e.g. HEIC the browser can't decode: send the original and let the server decide.
    return { full: file }
  }
}

export type Uploaded = { path: string; publicUrl?: string }

/**
 * Uploads photos straight to Supabase Storage. Returns [] when storage isn't
 * configured (local dev without Supabase).
 */
export async function uploadPhotos(files: File[], purpose: 'submission' | 'place'): Promise<Uploaded[]> {
  if (files.length === 0) return []
  const prepared = await Promise.all(files.map((f) => prepare(f, purpose === 'place')))
  let res: Awaited<ReturnType<typeof createUploadTargets>>
  try {
    res = await createUploadTargets(
      purpose,
      prepared.map(({ full, thumb }) => ({
        type: full.type,
        size: full.size,
        thumb: thumb && { type: thumb.type, size: thumb.size },
      })),
    )
  } catch (err) {
    // A page opened before a new deploy still points at the old server action.
    if (err instanceof Error && /Server Action .* was not found/.test(err.message))
      throw new Error('เว็บเพิ่งอัปเดตเวอร์ชันใหม่ กรุณารีเฟรชหน้านี้แล้วลองอีกครั้ง')
    throw err
  }
  if (!res.ok) throw new Error(res.error)
  if (!res.targets) return []

  const apikey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const put = async (signedUrl: string, blob: Blob) => {
    const body = new FormData()
    body.append('cacheControl', '31536000')
    body.append('', blob)
    const r = await fetch(signedUrl, {
      method: 'PUT',
      body,
      headers: { 'x-upsert': 'false', ...(apikey ? { apikey } : {}) },
    })
    if (!r.ok) throw new Error('อัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง')
  }
  await Promise.all(
    res.targets.map(async (t, i) => {
      await put(t.signedUrl, prepared[i].full)
      const thumb = prepared[i].thumb
      // The copy is a nice-to-have: cards fall back to the full photo without it.
      if (t.thumbSignedUrl && thumb) await put(t.thumbSignedUrl, thumb).catch(() => {})
    }),
  )
  return res.targets.map((t) => ({ path: t.path, publicUrl: t.publicUrl }))
}
