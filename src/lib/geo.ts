import { findArea, provinces, type Area } from '@/data/areas'

export type LatLng = { lat: number; lng: number }

const inThailandish = (p: LatLng) => p.lat > 4 && p.lat < 22 && p.lng > 96 && p.lng < 107

function pair(a: string, b: string): LatLng | undefined {
  const p = { lat: Number(a), lng: Number(b) }
  return Number.isFinite(p.lat) && Number.isFinite(p.lng) && inThailandish(p) ? p : undefined
}

/** "13.72, 100.77" as typed or copied from Google Maps. */
export function parseLatLng(v?: string): LatLng | undefined {
  const m = v?.trim().match(/^(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/)
  return m ? pair(m[1], m[2]) : undefined
}

/**
 * Coordinates inside a full Google Maps URL. The place pin (!3d..!4d..) wins
 * over the viewport centre (@lat,lng,zoom).
 */
export function latLngFromMapsUrl(url: string): LatLng | undefined {
  let s = url
  try {
    s = decodeURIComponent(url)
  } catch {}
  const pin = s.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (pin) return pair(pin[1], pin[2])
  const q = s.match(/[?&](?:q|query|ll|center|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
  if (q) return pair(q[1], q[2])
  const at = s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (at) return pair(at[1], at[2])
  return undefined
}

/** Follows short links (maps.app.goo.gl, goo.gl/maps) to the full URL, then reads its coordinates. */
export async function resolveMapsLatLng(url: string): Promise<LatLng | undefined> {
  const direct = latLngFromMapsUrl(url)
  if (direct) return direct
  let current = url
  for (let i = 0; i < 6; i++) {
    let res: Response
    try {
      res = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(6000) })
    } catch {
      return undefined
    }
    const next = res.headers.get('location')
    if (!next) return undefined
    current = new URL(next, current).toString()
    // Consent interstitials carry the real URL in ?continue=
    const cont = new URL(current).searchParams.get('continue')
    const found = latLngFromMapsUrl(current) ?? (cont ? latLngFromMapsUrl(cont) : undefined)
    if (found) return found
  }
  return undefined
}

/** Great-circle distance in km. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.max(100, Math.round(km * 10) * 100)} ม.`
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} กม.`
}

/** Service-area token for an area: "bangkok" or "bangkok/lat-krabang". */
export function areaToken(a: Area): string {
  return a.district ? `${a.province.slug}/${a.district.slug}` : a.province.slug
}

/** Valid tokens only, whole-province tokens absorbing their districts, sorted. */
export function cleanServiceAreas(tokens: string[]): string[] {
  const valid = [...new Set(tokens)].filter((t) => {
    const [p, d] = t.split('/')
    return Boolean(findArea(p, d)) && t.split('/').length <= 2
  })
  const whole = new Set(valid.filter((t) => !t.includes('/')))
  return valid.filter((t) => !t.includes('/') || !whole.has(t.split('/')[0])).sort()
}

type Located = { province: string; district?: string; serviceAreas?: string[] }

/**
 * Does this place belong on an area page? Its own address, or a service area
 * that covers it (a whole province covers every district; on a province page
 * any district of that province counts).
 */
export function coversArea(p: Located, area: Area): boolean {
  const prov = area.province.slug
  const dist = area.district?.slug
  if (p.province === prov && (!dist || p.district === dist)) return true
  return (p.serviceAreas ?? []).some((t) => {
    if (t === prov) return true
    if (!t.startsWith(`${prov}/`)) return false
    return !dist || t === `${prov}/${dist}`
  })
}

/** Every area page (province and district) a place appears on. */
export function areaKeys(p: Located): string[] {
  const keys = new Set<string>([p.province])
  if (p.district) keys.add(`${p.province}/${p.district}`)
  for (const t of p.serviceAreas ?? []) {
    const [prov, dist] = t.split('/')
    keys.add(prov)
    if (dist) keys.add(t)
    else
      for (const d of provinces.find((x) => x.slug === prov)?.districts ?? []) keys.add(`${prov}/${d.slug}`)
  }
  return [...keys]
}

/** Readable list: "ลาดกระบัง, บางนา (กรุงเทพฯ)" / "ทั้งจังหวัดเชียงใหม่". */
export function serviceAreaLabels(tokens: string[]): string[] {
  const byProvince = new Map<string, string[]>()
  for (const t of tokens) {
    const [p, d] = t.split('/')
    const list = byProvince.get(p) ?? []
    list.push(d ?? '*')
    byProvince.set(p, list)
  }
  const out: string[] = []
  for (const [p, ds] of byProvince) {
    const prov = findArea(p)?.province
    if (!prov) continue
    if (ds.includes('*')) out.push(`ทั้ง${prov.slug === 'bangkok' ? '' : 'จังหวัด'}${prov.name}`)
    else
      out.push(
        `${ds
          .map((d) => findArea(p, d)?.district?.name)
          .filter(Boolean)
          .join(', ')} (${prov.name})`,
      )
  }
  return out
}
