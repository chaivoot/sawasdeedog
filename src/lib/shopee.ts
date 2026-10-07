/**
 * Shopee links. The link pasted in the admin is the one made in the Shopee
 * affiliate portal (s.shopee.co.th/…), which already carries our affiliate id,
 * so it is used as is.
 */
export function isShopeeUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    return u.protocol === 'https:' && /(^|\.)(shopee\.co\.th|shope\.ee)$/.test(u.hostname.toLowerCase())
  } catch {
    return false
  }
}

/** A short link from the affiliate portal; a plain product page earns nothing. */
export function isAffiliateShortLink(raw: string): boolean {
  try {
    const host = new URL(raw).hostname.toLowerCase()
    return host === 's.shopee.co.th' || host === 'shope.ee'
  } catch {
    return false
  }
}
