/** Agoda hotel links. Only agoda.com pages are accepted. */
export function isAgodaUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    return u.protocol === 'https:' && /(^|\.)agoda\.com$/.test(u.hostname)
  } catch {
    return false
  }
}

/** Partner-portal links (partnersearch.aspx?hid=…) carry the hotel in their query. */
const KEEP_PARTNER_PARAMS = ['pcs', 'hid', 'hl']

/**
 * The link users follow: tracking and date parameters pasted with the page are dropped
 * (Agoda asks for dates itself), and our partner id is added when AGODA_CID is set.
 */
export function agodaLink(raw: string, cid = process.env.AGODA_CID?.trim()): string | undefined {
  if (!isAgodaUrl(raw)) return undefined
  const u = new URL(raw)
  const kept = u.pathname.startsWith('/partners/')
    ? KEEP_PARTNER_PARAMS.flatMap((k) => (u.searchParams.has(k) ? [[k, u.searchParams.get(k)!]] : []))
    : []
  u.search = ''
  u.hash = ''
  for (const [k, v] of kept) u.searchParams.set(k, v)
  if (cid && /^\d+$/.test(cid)) u.searchParams.set('cid', cid)
  return u.toString()
}
