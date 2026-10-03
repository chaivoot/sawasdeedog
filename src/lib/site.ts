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

/**
 * Default meta description. Names what is listed, so search engines use it as the snippet
 * instead of picking text off the page (they did: the area picker's labels).
 */
export const SITE_DESCRIPTION =
  'รวมคาเฟ่ ร้านอาหาร ที่พัก โรงพยาบาลสัตว์ ร้านอาบน้ำ ฝากเลี้ยง และลานวิ่ง ที่พาน้องหมาเข้าได้จริง ทีมงานคัดและเช็คเองทุกที่ ทั้งกรุงเทพฯ และต่างจังหวัด'

/** Official SawasdeeDog profiles, linked from the Organization structured data. */
export const SOCIAL_PROFILES = ['https://www.facebook.com/sawasdeedog']

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl()).toString()
}

/** Share image used when a page has no photo of its own. */
export const DEFAULT_OG_IMAGE = { url: '/logo-full.jpg', width: 480, height: 480, alt: SITE_NAME }
