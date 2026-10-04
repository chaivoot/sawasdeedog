import { PLACE_PHOTOS_BUCKET } from './supabase-names'

// Every place photo we store has a card-sized copy beside it: 2026-10/abc.webp → 2026-10/abc.sm.webp.
// Listing cards load the copy; the place page loads the full photo.

const PUBLIC_PREFIX = `/storage/v1/object/public/${PLACE_PHOTOS_BUCKET}/`
const THUMB_RE = /\.sm\.[a-z0-9]+$/i

/** Longest edge of the card-sized copy. Cards show at most ~400px wide (800 on 2x screens). */
export const THUMB_EDGE = 640

export const isThumbPath = (path: string) => THUMB_RE.test(path)

/** abc.webp → abc.sm.webp */
export function thumbPathOf(path: string): string {
  return path.replace(/\.([a-z0-9]+)$/i, '.sm.$1')
}

/** Path inside the place-photos bucket for one of our own public URLs; undefined for any other URL. */
export function placePhotoPath(url: string): string | undefined {
  try {
    const u = new URL(url)
    const i = u.pathname.indexOf(PUBLIC_PREFIX)
    return i === -1 ? undefined : decodeURIComponent(u.pathname.slice(i + PUBLIC_PREFIX.length))
  } catch {
    return undefined
  }
}

/** URL of the card-sized copy, or undefined when the photo isn't one of ours. */
export function thumbUrl(url: string): string | undefined {
  const path = placePhotoPath(url)
  if (!path || isThumbPath(path)) return undefined
  return url.replace(/\.([a-z0-9]+)(\?.*)?$/i, '.sm.$1$2')
}
