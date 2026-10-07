import 'server-only'
import sharp from 'sharp'
import { articleImageUrls } from './articles'
import { productImageUrls } from './products'
import { THUMB_EDGE, isThumbPath, placePhotoPath, thumbPathOf } from './photo-urls'
import { PLACE_PHOTOS_BUCKET, db } from './supabase'

// Housekeeping for the place-photos bucket: files go when their place or photo does,
// and card-sized copies are made for photos uploaded before copies existed.

/** Files younger than this are never treated as unused: an editor may not have saved yet. */
const ORPHAN_MIN_AGE_MS = 24 * 60 * 60 * 1000

const bucket = () => db().storage.from(PLACE_PHOTOS_BUCKET)

/** Every photo any place (published or not), article or product uses. */
async function usedPhotoPaths(): Promise<Set<string>> {
  const [{ data, error }, articleUrls, productUrls] = await Promise.all([
    db().from('places').select('photos'),
    articleImageUrls(),
    productImageUrls(),
  ])
  if (error) throw error
  const used = new Set<string>()
  const urls = [
    ...(data as { photos: string[] | null }[]).flatMap((r) => r.photos ?? []),
    ...articleUrls,
    ...productUrls,
  ]
  for (const url of urls) {
    const path = placePhotoPath(url)
    if (path) used.add(path)
  }
  return used
}

/**
 * Deletes the files behind photos a place no longer uses (and their card copies), unless
 * another place still lists them. Best effort: a failure is logged, never shown to the editor.
 */
export async function removePlacePhotos(urls: string[]): Promise<void> {
  const paths = urls.map(placePhotoPath).filter((p): p is string => !!p)
  if (paths.length === 0) return
  try {
    const used = await usedPhotoPaths()
    const gone = paths.filter((p) => !used.has(p))
    if (gone.length === 0) return
    const { error } = await bucket().remove(gone.flatMap((p) => [p, thumbPathOf(p)]))
    if (error) console.error(error)
  } catch (err) {
    console.error(err)
  }
}

type StoredFile = { path: string; size: number; createdAt: string }

/** All files in the bucket. Uploads live in one level of month folders (2026-10/…). */
async function listFiles(): Promise<StoredFile[]> {
  const files: StoredFile[] = []
  const page = async (folder: string) => {
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await bucket().list(folder, { limit: 1000, offset })
      if (error) throw error
      for (const item of data) {
        const path = folder ? `${folder}/${item.name}` : item.name
        // Folders come back without an id.
        if (item.id === null) await page(path)
        else
          files.push({
            path,
            size: Number((item.metadata as { size?: number } | null)?.size ?? 0),
            createdAt: item.created_at ?? '',
          })
      }
      if (data.length < 1000) return
    }
  }
  await page('')
  return files
}

export type PhotoReport = {
  files: number
  bytes: number
  /** Used photos with no card copy yet. */
  missingThumbs: string[]
  /** Files no place uses, older than a day. */
  orphans: StoredFile[]
  orphanBytes: number
}

export async function photoReport(): Promise<PhotoReport> {
  const [files, used] = await Promise.all([listFiles(), usedPhotoPaths()])
  const present = new Set(files.map((f) => f.path))
  const cutoff = Date.now() - ORPHAN_MIN_AGE_MS
  const isUsed = (path: string) =>
    used.has(path) || (isThumbPath(path) && used.has(path.replace(/\.sm(\.[a-z0-9]+)$/i, '$1')))
  const orphans = files.filter((f) => !isUsed(f.path) && Date.parse(f.createdAt) < cutoff)
  return {
    files: files.length,
    bytes: files.reduce((n, f) => n + f.size, 0),
    missingThumbs: [...used].filter((p) => present.has(p) && !present.has(thumbPathOf(p))),
    orphans,
    orphanBytes: orphans.reduce((n, f) => n + f.size, 0),
  }
}

const FORMAT: Record<string, 'webp' | 'jpeg' | 'png'> = {
  webp: 'webp',
  jpg: 'jpeg',
  jpeg: 'jpeg',
  png: 'png',
}

/** Makes card copies for up to `limit` photos; returns how many were made. */
export async function makeMissingThumbs(paths: string[], limit: number): Promise<number> {
  let made = 0
  for (const path of paths.slice(0, limit)) {
    const ext = path.split('.').pop()!.toLowerCase()
    const format = FORMAT[ext]
    if (!format) continue
    const { data, error } = await bucket().download(path)
    if (error || !data) {
      console.error(error)
      continue
    }
    const out = await sharp(Buffer.from(await data.arrayBuffer()))
      .rotate()
      .resize(THUMB_EDGE, THUMB_EDGE, { fit: 'inside', withoutEnlargement: true })
      .toFormat(format, { quality: 78 })
      .toBuffer()
    const up = await bucket().upload(thumbPathOf(path), out, {
      contentType: `image/${format}`,
      cacheControl: '31536000',
      upsert: true,
    })
    if (up.error) console.error(up.error)
    else made++
  }
  return made
}

/** Deletes files no place uses (older than a day, rechecked now); returns how many. */
export async function deleteOrphans(): Promise<number> {
  const { orphans } = await photoReport()
  let deleted = 0
  // The storage API takes a limited batch per call.
  for (let i = 0; i < orphans.length; i += 100) {
    const batch = orphans.slice(i, i + 100).map((f) => f.path)
    const { error } = await bucket().remove(batch)
    if (error) console.error(error)
    else deleted += batch.length
  }
  return deleted
}
