import { trainerStyles, type Category } from '@/data/categories'

export type ListingParams = {
  type?: string
  style?: string
  filters: string[]
  /** "ใกล้ฉัน": results by the visitor's location instead of an area. */
  near?: boolean
}

/** URL for a listing page with its type / trainer style / filter query. */
export function listingHref(basePath: string, p: ListingParams) {
  const search = new URLSearchParams()
  if (p.style) search.set('style', p.style)
  if (p.type) search.set('type', p.type)
  if (p.filters.length) search.set('f', p.filters.join(','))
  if (p.near) search.set('near', '1')
  const qs = search.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

function one(v: string | string[] | null | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? undefined
}

/** Type / trainer style / filters from a listing URL, keeping only values the category has. */
export function parseListingParams(
  category: Category,
  sp: Record<string, string | string[] | undefined> | URLSearchParams,
): ListingParams {
  const get = (k: string) => (sp instanceof URLSearchParams ? sp.get(k) : one(sp[k]))
  const type = get('type') ?? undefined
  const style = get('style') ?? undefined
  const f = get('f')?.split(',') ?? []
  return {
    type: category.types?.some((t) => t.slug === type) ? type : undefined,
    style:
      category.slug === 'trainer'
        ? (trainerStyles.find((s) => s.slug === style)?.slug ?? trainerStyles[0].slug)
        : undefined,
    filters: category.filters.map((x) => x.slug).filter((s) => f.includes(s)),
    near: get('near') === '1',
  }
}
