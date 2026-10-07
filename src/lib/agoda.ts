/** Agoda hotel links. Only agoda.com pages are accepted. */
export function isAgodaUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    return u.protocol === 'https:' && /(^|\.)agoda\.com$/.test(u.hostname)
  } catch {
    return false
  }
}

/**
 * The link users follow: tracking and date parameters pasted with the page are dropped
 * (Agoda asks for dates itself), and our partner id is added when AGODA_CID is set.
 */
export function agodaLink(raw: string, cid = process.env.AGODA_CID?.trim()): string | undefined {
  if (!isAgodaUrl(raw)) return undefined
  const u = new URL(raw)
  u.search = ''
  u.hash = ''
  if (cid && /^\d+$/.test(cid)) u.searchParams.set('cid', cid)
  return u.toString()
}
