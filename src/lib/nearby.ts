import type { Area } from '@/data/areas'
import type { Place } from '@/data/places'
import { approxDistanceKm } from './area-distance'
import { coversArea, distanceKm, type LatLng } from './geo'
import { NEAR_ME_KM } from './limits'

export type NearPlace = { place: Place; km: number; approx: boolean }

/**
 * Which of `places` count as near `here`: unpinned places in or visiting the
 * visitor's district (`local`), then the rest within NEAR_ME_KM by distance,
 * exact for pins and to the nearest district otherwise (`near`, closest first).
 */
export function matchNearby(places: Place[], here: LatLng, area: Area | undefined) {
  const pinned = (p: Place) => p.lat != null && p.lng != null
  const local = area ? places.filter((p) => !pinned(p) && coversArea(p, area)) : []
  const isLocal = new Set(local.map((p) => p.slug))
  const near = places
    .filter((p) => !isLocal.has(p.slug))
    .map((p) =>
      pinned(p)
        ? { place: p, km: distanceKm(here, { lat: p.lat!, lng: p.lng! }), approx: false }
        : { place: p, km: approxDistanceKm(here, p), approx: true },
    )
    .filter((x): x is NearPlace => x.km != null)
    .sort((a, b) => a.km - b.km)
    .filter((x) => x.km <= NEAR_ME_KM)
  return { local, near }
}
