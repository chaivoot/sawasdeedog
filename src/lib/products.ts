import 'server-only'
import { cache } from 'react'
import { allRows, db, isSupabaseConfigured } from './supabase'

export type Product = {
  id: string
  /** Page address; older items without one are linked by id. */
  slug?: string
  name: string
  brand?: string
  category: string
  subcategory?: string
  imageUrl?: string
  priceNote?: string
  reason?: string
  recommendedBy?: string
  buyUrl?: string
  sort: number
  published: boolean
  updatedAt: string
}

type ProductRow = {
  id: string
  slug: string | null
  name: string
  brand: string | null
  category: string
  subcategory: string | null
  image_url: string | null
  price_note: string | null
  reason: string | null
  recommended_by: string | null
  buy_url: string | null
  sort: number
  published: boolean
  updated_at: string
}

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug ?? undefined,
    name: r.name,
    brand: r.brand ?? undefined,
    category: r.category,
    subcategory: r.subcategory ?? undefined,
    imageUrl: r.image_url ?? undefined,
    priceNote: r.price_note ?? undefined,
    reason: r.reason ?? undefined,
    recommendedBy: r.recommended_by ?? undefined,
    buyUrl: r.buy_url ?? undefined,
    sort: r.sort,
    published: r.published,
    updatedAt: r.updated_at,
  }
}

/**
 * Published items in list order. Empty when Supabase isn't set up or the products
 * table hasn't been created yet (so the site still builds).
 */
export const listPublishedProducts = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) return []
  try {
    const rows = await allRows<ProductRow>((from, to) =>
      db()
        .from('products')
        .select('*')
        .eq('published', true)
        .order('sort')
        .order('name')
        .order('id')
        .range(from, to),
    )
    return rows.map(rowToProduct)
  } catch (e) {
    console.error('products:', e instanceof Error ? e.message : e)
    return []
  }
})

/** A published item by its page address (slug, or id for items saved before slugs). */
export async function getPublishedProduct(category: string, key: string): Promise<Product | undefined> {
  const key2 = decodeURIComponent(key)
  return (await listPublishedProducts()).find(
    (p) => p.category === category && (p.slug === key2 || (!p.slug && p.id === key2)),
  )
}

/** Where an item's page lives. */
export function productPath(p: Pick<Product, 'id' | 'slug' | 'category'>): string {
  return `/items/${p.category}/${p.slug ?? p.id}`
}

// Admin ---------------------------------------------------------------------

export async function listAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return []
  const rows = await allRows<ProductRow>((from, to) =>
    db()
      .from('products')
      .select('*')
      .order('category')
      .order('sort')
      .order('name')
      .order('id')
      .range(from, to),
  )
  return rows.map(rowToProduct)
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data, error } = await db().from('products').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? rowToProduct(data as ProductRow) : undefined
}

export type ProductInput = {
  slug: string
  name: string
  brand: string | null
  category: string
  subcategory: string | null
  image_url: string | null
  price_note: string | null
  reason: string | null
  recommended_by: string | null
  buy_url: string | null
  sort: number
  published: boolean
  updated_by: string
}

export async function upsertProduct(input: ProductInput, id?: string): Promise<string> {
  const q = id
    ? db().from('products').update(input).eq('id', id).select('id').single()
    : db().from('products').insert(input).select('id').single()
  const { data, error } = await q
  if (error) throw error
  return (data as { id: string }).id
}

/** Slugs already used by other items, so new ones can be made unique. */
export async function takenProductSlugs(exceptId?: string): Promise<Set<string>> {
  const rows = await allRows<{ id: string; slug: string | null }>((from, to) =>
    db().from('products').select('id, slug').order('id').range(from, to),
  )
  return new Set(rows.flatMap((r) => (r.slug && r.id !== exceptId ? [r.slug] : [])))
}

export async function insertProducts(inputs: ProductInput[]): Promise<void> {
  const { error } = await db().from('products').insert(inputs)
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await db().from('products').delete().eq('id', id)
  if (error) throw error
}

/** Every image URL an item uses, so photo cleanup keeps them. */
export async function productImageUrls(): Promise<string[]> {
  if (!isSupabaseConfigured()) return []
  try {
    const rows = await allRows<{ image_url: string | null }>((from, to) =>
      db().from('products').select('image_url').order('id').range(from, to),
    )
    return rows.flatMap((r) => (r.image_url ? [r.image_url] : []))
  } catch (e) {
    // Before the products table exists there is nothing to keep. Any other failure must
    // stop the sweep, or it would delete photos it never saw.
    if (isMissingTable(e)) return []
    throw e
  }
}

function isMissingTable(e: unknown): boolean {
  const code = (e as { code?: string } | null)?.code
  return code === '42P01' || code === 'PGRST205'
}
