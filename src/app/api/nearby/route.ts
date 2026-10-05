import { getCategory, type TrainerStyle } from '@/data/categories'
import { areaName } from '@/data/areas'
import { parseListingParams } from '@/lib/listing'
import { locateArea } from '@/lib/locate'
import { matchNearby } from '@/lib/nearby'
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

  const { local, near } = matchNearby(places, here, area)

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
