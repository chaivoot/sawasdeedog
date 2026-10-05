import { categories } from '@/data/categories'
import { placeCategories } from '@/data/places'
import { locateArea } from '@/lib/locate'
import { matchNearby } from '@/lib/nearby'
import { listAllPlaces } from '@/lib/places'

export const dynamic = 'force-dynamic'

/** Categories whose home tile can say how many places are near the visitor. */
const NEAR_COUNT_CATEGORIES = categories.map((c) => c.slug).filter((s) => s !== 'farm' && s !== 'stay')

/**
 * How many places of each category are near a point, matched as on "ใกล้ฉัน"
 * listings. The point is used for this response only.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const lat = Number(url.searchParams.get('lat'))
  const lng = Number(url.searchParams.get('lng'))
  if (!Number.isFinite(lat) || !Number.isFinite(lng))
    return Response.json({ error: 'bad request' }, { status: 400 })

  const here = { lat, lng }
  const [places, area] = await Promise.all([listAllPlaces(), locateArea(here)])
  const counts: Record<string, number> = {}
  for (const slug of NEAR_COUNT_CATEGORIES) {
    const { local, near } = matchNearby(
      places.filter((p) => placeCategories(p).includes(slug)),
      here,
      area,
    )
    counts[slug] = local.length + near.length
  }
  return Response.json({ counts }, { headers: { 'Cache-Control': 'private, no-store' } })
}
