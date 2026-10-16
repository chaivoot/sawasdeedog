/** Where an item's page lives; items saved before slugs are linked by id. */
export function productPath(p: { id: string; slug?: string; category: string }): string {
  return `/items/${p.category}/${p.slug ?? p.id}`
}
