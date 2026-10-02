import { createUploadTargets } from '@/app/actions/uploads'

const MAX_EDGE = 1600

/** Downscale to at most 1600px on the long edge as JPEG; keeps small files as-is. */
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85))
    return blob ?? file
  } catch {
    // e.g. HEIC the browser can't decode: send the original and let the server decide.
    return file
  }
}

export type Uploaded = { path: string; publicUrl?: string }

/**
 * Uploads photos straight to Supabase Storage. Returns [] when storage isn't
 * configured (local dev without Supabase).
 */
export async function uploadPhotos(files: File[], purpose: 'submission' | 'place'): Promise<Uploaded[]> {
  if (files.length === 0) return []
  const blobs = await Promise.all(files.map(shrink))
  let res: Awaited<ReturnType<typeof createUploadTargets>>
  try {
    res = await createUploadTargets(
      purpose,
      blobs.map((b) => ({ type: b.type, size: b.size })),
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
  await Promise.all(
    res.targets.map(async (t, i) => {
      const body = new FormData()
      body.append('cacheControl', '31536000')
      body.append('', blobs[i])
      const r = await fetch(t.signedUrl, {
        method: 'PUT',
        body,
        headers: { 'x-upsert': 'false', ...(apikey ? { apikey } : {}) },
      })
      if (!r.ok) throw new Error('อัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง')
    }),
  )
  return res.targets.map((t) => ({ path: t.path, publicUrl: t.publicUrl }))
}
