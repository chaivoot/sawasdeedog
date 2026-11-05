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

/** Our Shopee affiliate id (not a secret: it appears in every affiliate link). */
const SHOPEE_AFFILIATE_ID = '15309190191'

/**
 * A Shopee page link sent through Shopee's affiliate redirect with our id, so the click
 * counts for us (help.shopee.co.th article 172214). `subId` tags where on the site it was.
 * Short links (s.shopee.co.th, shope.ee) are already someone's affiliate link and other
 * links are returned as they are.
 */
export function shopeeAffiliateLink(raw: string, subId = 'sawasdeedog'): string {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:' || !/^(www\.)?shopee\.co\.th$/.test(u.hostname)) return raw
    const params = new URLSearchParams({
      origin_link: u.toString(),
      affiliate_id: SHOPEE_AFFILIATE_ID,
      sub_id: subId,
    })
    return `https://s.shopee.co.th/an_redir?${params}`
  } catch {
    return raw
  }
}
