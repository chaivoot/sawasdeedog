// Public origin used for canonical URLs, sitemap and structured data.
const FALLBACK = 'https://sawasdeedog.com'

export function siteUrl(): string {
  const raw = process.env.SITE_URL?.trim()
  if (!raw) return FALLBACK
  try {
    return new URL(/^https?:\/\//.test(raw) ? raw : `https://${raw}`).origin
  } catch {
    return FALLBACK
  }
}

export const SITE_NAME = 'SawasdeeDog'

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl()).toString()
}

/** Share image used when a page has no photo of its own. */
export const DEFAULT_OG_IMAGE = { url: '/logo-full.jpg', width: 480, height: 480, alt: SITE_NAME }
