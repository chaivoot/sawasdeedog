/** Affiliate short links from Involve Asia; they redirect to the booking site. */
const AFFILIATE_HOSTS = [/(^|\.)invl\.(me|io)$/, /(^|\.)invol\.co$/]

/** Booking sites a stay's booking link may point to directly. Agoda has its own field. */
const SITES = [
  { host: /(^|\.)traveloka\.com$/, name: 'Traveloka' },
  { host: /(^|\.)trip\.com$/, name: 'Trip.com' },
  { host: /(^|\.)booking\.com$/, name: 'Booking.com' },
]

function httpsHost(raw: string): string | undefined {
  try {
    const u = new URL(raw)
    return u.protocol === 'https:' ? u.hostname : undefined
  } catch {
    return undefined
  }
}

/** A stay's booking link: an Involve Asia short link or a page on a known booking site. */
export function isBookingUrl(raw: string): boolean {
  const host = httpsHost(raw)
  return !!host && (AFFILIATE_HOSTS.some((h) => h.test(host)) || SITES.some((s) => s.host.test(host)))
}

/**
 * What the button says about a booking link: the site's name when the link shows it,
 * and whether it is an affiliate link (which carries the disclosure).
 */
export function bookingSite(raw: string): { name?: string; affiliate: boolean } | undefined {
  const host = httpsHost(raw)
  if (!host || !isBookingUrl(raw)) return undefined
  return {
    name: SITES.find((s) => s.host.test(host))?.name,
    affiliate: AFFILIATE_HOSTS.some((h) => h.test(host)),
  }
}
