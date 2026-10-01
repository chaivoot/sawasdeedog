export type ListingParams = {
  type?: string
  style?: string
  filters: string[]
}

/** URL for a listing page with its type / trainer style / filter query. */
export function listingHref(basePath: string, p: ListingParams) {
  const search = new URLSearchParams()
  if (p.style) search.set('style', p.style)
  if (p.type) search.set('type', p.type)
  if (p.filters.length) search.set('f', p.filters.join(','))
  const qs = search.toString()
  return qs ? `${basePath}?${qs}` : basePath
}
