import 'server-only'
import { findArea, provinces, type Area } from '@/data/areas'
import type { LatLng } from './geo'

// Which province / district a point is in, via OpenStreetMap's Nominatim.
// Points are rounded to ~1 km before leaving the server, results are cached,
// and nothing about the visitor is stored. Usage policy: identify the app,
// at most ~1 request a second (the cache keeps us far below that).

const norm = (s: string) => s.replace(/\s+/g, '').replace(/^(จังหวัด|อำเภอ|กิ่งอำเภอ|เขต)/, '')

function matchArea(addr: Record<string, string>): Area | undefined {
  const isBangkok = [addr.city, addr.state, addr.province].some((v) => v === 'กรุงเทพมหานคร')
  const province = isBangkok
    ? provinces.find((p) => p.slug === 'bangkok')
    : provinces.find((p) => norm(p.name) === norm(addr.province ?? addr.state ?? ''))
  if (!province) return undefined
  const districtName = isBangkok ? addr.suburb : (addr.county ?? addr.city_district)
  const district = districtName
    ? province.districts.find((d) => norm(d.name) === norm(districtName))
    : undefined
  return findArea(province.slug, district?.slug)
}

export async function locateArea(p: LatLng): Promise<Area | undefined> {
  const lat = p.lat.toFixed(2)
  const lng = p.lng.toFixed(2)
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=th&lat=${lat}&lon=${lng}`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SawasdeeDog/1.0 (+https://sawasdeedog.com)' },
      next: { revalidate: 60 * 60 * 24 * 30 },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return undefined
    const data = (await res.json()) as { address?: Record<string, string> }
    return data.address ? matchArea(data.address) : undefined
  } catch {
    return undefined
  }
}
