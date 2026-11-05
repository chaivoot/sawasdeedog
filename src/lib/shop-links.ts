/** Where a buy link goes, for its button label. */
export function shopName(raw: string): string {
  try {
    const host = new URL(raw).hostname.replace(/^www\./, '')
    if (/(^|\.)shopee\.co\.th$/.test(host) || host === 'shope.ee') return 'Shopee'
    if (/(^|\.)lazada\.co\.th$/.test(host)) return 'Lazada'
    return host
  } catch {
    return 'ร้านค้า'
  }
}

export function isHttpsUrl(raw: string): boolean {
  try {
    return new URL(raw).protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Shops and booking sites whose links may carry our affiliate id (Shopee, Lazada, Involve
 * Asia, Agoda, Traveloka). Google asks for rel="sponsored" on such links.
 */
const SPONSORED_HOSTS = [
  /(^|\.)shopee\.co\.th$/,
  /^shope\.ee$/,
  /(^|\.)lazada\.co\.th$/,
  /(^|\.)invl\.(me|io)$/,
  /(^|\.)invol\.co$/,
  /(^|\.)agoda\.com$/,
  /(^|\.)traveloka\.com$/,
]

export function isSponsoredUrl(raw: string): boolean {
  try {
    const host = new URL(raw).hostname.replace(/^www\./, '')
    return SPONSORED_HOSTS.some((h) => h.test(host))
  } catch {
    return false
  }
}
