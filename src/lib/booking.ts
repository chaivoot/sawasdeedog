import { todayInBangkok } from './format'

/** Affiliate short links from Involve Asia; they redirect to the booking site. */
const AFFILIATE_HOSTS = [/(^|\.)invl\.(me|io)$/, /(^|\.)invol\.co$/]

/**
 * Booking sites a stay's booking link may point to directly. Agoda has its own field.
 * `affiliate` is our Involve Asia link for the site: given `?url=<page>` it tracks a
 * click to that page under our publisher id, so plain pages need no link of their own.
 */
const SITES: { host: RegExp; name: string; affiliate?: string }[] = [
  { host: /(^|\.)traveloka\.com$/, name: 'Traveloka', affiliate: 'https://invl.me/clo6fk7' },
  { host: /(^|\.)trip\.com$/, name: 'Trip.com' },
  { host: /(^|\.)booking\.com$/, name: 'Booking.com' },
]

/** Query parameters a booking page keeps; the rest is search and session tracking. */
const KEEP_PARAMS = ['spec']

const DAY_MS = 24 * 60 * 60 * 1000
const pad = (n: number) => String(n).padStart(2, '0')
const specDate = (ms: number) => {
  const d = new Date(ms)
  return `${pad(d.getUTCDate())}-${pad(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}`
}

/**
 * A Traveloka hotel page copied from a search carries that day's stay dates
 * (spec=DD-MM-YYYY.DD-MM-YYYY.…). Once they are past, the stay moves to today
 * (Bangkok), same number of nights; pages are re-rendered hourly.
 */
function freshSpec(param: string, today = todayInBangkok()): string {
  const m = /^spec=(\d{2})-(\d{2})-(\d{4})\.(\d{2})-(\d{2})-(\d{4})\.(.*)$/.exec(param)
  if (!m) return param
  const checkIn = Date.UTC(+m[3], +m[2] - 1, +m[1])
  const checkOut = Date.UTC(+m[6], +m[5] - 1, +m[4])
  const [y, mo, d] = today.split('-').map(Number)
  const start = Date.UTC(y, mo - 1, d)
  if (checkIn >= start) return param
  const nights = Math.max(1, Math.round((checkOut - checkIn) / DAY_MS))
  return `spec=${specDate(start)}.${specDate(start + nights * DAY_MS)}.${m[7]}`
}

function httpsUrl(raw: string): URL | undefined {
  try {
    const u = new URL(raw)
    return u.protocol === 'https:' ? u : undefined
  } catch {
    return undefined
  }
}

/** A stay's booking link: an Involve Asia short link or a page on a known booking site. */
export function isBookingUrl(raw: string): boolean {
  const host = httpsUrl(raw)?.hostname
  return !!host && (AFFILIATE_HOSTS.some((h) => h.test(host)) || SITES.some((s) => s.host.test(host)))
}

/**
 * The booking button for a link: where it goes, the site's name when known, and whether
 * it is an affiliate link (which carries the disclosure). A page on a site we have an
 * Involve Asia link for is sent through it, without its search and session parameters.
 */
export function bookingLink(raw: string): { href: string; name?: string; affiliate: boolean } | undefined {
  const u = httpsUrl(raw)
  if (!u || !isBookingUrl(raw)) return undefined
  if (AFFILIATE_HOSTS.some((h) => h.test(u.hostname))) return { href: raw, affiliate: true }
  const site = SITES.find((s) => s.host.test(u.hostname))!
  if (!site.affiliate) return { href: raw, name: site.name, affiliate: false }
  // Kept as written: re-encoding would turn the %20s in Traveloka's spec into +.
  const kept = u.search
    .slice(1)
    .split('&')
    .filter((p) => KEEP_PARAMS.includes(p.split('=')[0]))
    .map((p) => freshSpec(p))
  u.hash = ''
  u.search = kept.length ? `?${kept.join('&')}` : ''
  return {
    href: `${site.affiliate}?url=${encodeURIComponent(u.toString())}`,
    name: site.name,
    affiliate: true,
  }
}
