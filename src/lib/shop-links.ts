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
