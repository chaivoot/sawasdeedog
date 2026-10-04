import { getCategory, type TrainerStyle } from '@/data/categories'
import { areaName } from '@/data/areas'
import type { Place } from '@/data/places'
import { approxDistanceKm } from '@/lib/area-distance'
import { coversArea, distanceKm } from '@/lib/geo'
import { parseListingParams } from '@/lib/listing'
import { locateArea } from '@/lib/locate'
import { NEAR_ME_KM } from '@/lib/limits'
import { listPlaces } from '@/lib/places'

export const dynamic = 'force-dynamic'

/**
 * Places near a point for one category: by distance (approximate for places
 * without a pin), then unpinned places in or visiting the visitor's district. The point is used for this response only.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const category = getCategory(url.searchParams.get('category') ?? '')
  const lat = Number(url.searchParams.get('lat'))
  const lng = Number(url.searchParams.get('lng'))
  if (!category || category.slug === 'farm' || !Number.isFinite(lat) || !Number.isFinite(lng))
    return Response.json({ error: 'bad request' }, { status: 400 })

  const here = { lat, lng }
  const lp = parseListingParams(category, url.searchParams)
  const [places, area] = await Promise.all([
    listPlaces({
      category: category.slug,
      type: lp.type,
      trainerStyle: lp.style as TrainerStyle | undefined,
      filters: lp.filters,
    }),
    locateArea(here),
  ])

  const pinned = (p: Place) => p.lat != null && p.lng != null
  // Without a pin, a place that is in or visits the visitor's district is listed as local.
  const local = area ? places.filter((p) => !pinned(p) && coversArea(p, area)) : []
  const isLocal = new Set(local.map((p) => p.slug))
  // Everything else by distance: exact for pins, else to the nearest district it is in or visits.
  const near = places
    .filter((p) => !isLocal.has(p.slug))
    .map((p) =>
      pinned(p)
        ? { place: p, km: distanceKm(here, { lat: p.lat!, lng: p.lng! }), approx: false }
        : { place: p, km: approxDistanceKm(here, p), approx: true },
    )
    .filter((x): x is { place: Place; km: number; approx: boolean } => x.km != null)
    .sort((a, b) => a.km - b.km)
    .filter((x) => x.km <= NEAR_ME_KM)

  return Response.json(
    {
      area: area
        ? {
            name: areaName(area),
            path: `/${category.slug}/${area.province.slug}${area.district ? `/${area.district.slug}` : ''}`,
          }
        : null,
      near,
      local,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
