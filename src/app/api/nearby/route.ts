import { getCategory, type TrainerStyle } from '@/data/categories'
import { areaName } from '@/data/areas'
import { coversArea, distanceKm } from '@/lib/geo'
import { parseListingParams } from '@/lib/listing'
import { locateArea } from '@/lib/locate'
import { listPlaces } from '@/lib/places'

export const dynamic = 'force-dynamic'

/** Storefronts within this distance are listed; farther ones would not be "near". */
const MAX_KM = 40

/**
 * Places near a point for one category: storefronts by distance, then services
 * that visit the visitor's district. The point is used for this response only.
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

  const near = places
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({ place: p, km: distanceKm(here, { lat: p.lat!, lng: p.lng! }) }))
    .filter((x) => x.km <= MAX_KM)
    .sort((a, b) => a.km - b.km)
  const shown = new Set(near.map((x) => x.place.slug))
  // Visiting services covering this district, and places in it whose location we don't have.
  const local = area ? places.filter((p) => !shown.has(p.slug) && coversArea(p, area)) : []

  return Response.json(
    {
      area: area
        ? {
            name: areaName(area),
            path: `/${category.slug}/${area.province.slug}${area.district ? `/${area.district.slug}` : ''}`,
          }
        : null,
      near: near.map((x) => ({ place: x.place, km: x.km })),
      local,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
