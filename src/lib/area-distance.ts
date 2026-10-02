import 'server-only'
import { areaCenters } from '@/data/area-centers.generated'
import type { Place } from '@/data/places'
import { distanceKm, type LatLng } from './geo'

const centre = (key: string): LatLng | undefined => {
  const c = areaCenters[key]
  return c && { lat: c[0], lng: c[1] }
}

/** District (or province) centres a place is at or visits. */
function placePoints(p: Place): LatLng[] {
  const keys = [p.district ? `${p.province}/${p.district}` : p.province]
  for (const t of p.serviceAreas ?? []) {
    if (t.includes('/')) keys.push(t)
    // A whole province: any of its districts may be the closest.
    else keys.push(...Object.keys(areaCenters).filter((k) => k.startsWith(`${t}/`)), t)
  }
  return keys.map(centre).filter((c): c is LatLng => Boolean(c))
}

/**
 * Rough distance for a place without a pin: to the nearest centre of the
 * district it is in or visits. Undefined when we know none of them.
 */
export function approxDistanceKm(here: LatLng, p: Place): number | undefined {
  const ds = placePoints(p).map((c) => distanceKm(here, c))
  return ds.length ? Math.min(...ds) : undefined
}
