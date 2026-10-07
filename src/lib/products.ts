import 'server-only'
import { cache } from 'react'
import { db, isSupabaseConfigured } from './supabase'

export type Product = {
  id: string
  name: string
  group: string
  reason?: string
  imageUrl?: string
  shopeeUrl: string
  sort: number
  /** ISO date of the team's last check that the link still works. */
  checkedAt: string
  published: boolean
  updatedAt: string
}

type ProductRow = {
  id: string
  name: string
  group_slug: string
  reason: string | null
  image_url: string | null
  shopee_url: string
  sort: number
  checked_at: string
  published: boolean
  updated_at: string
}

const rowToProduct = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  group: r.group_slug,
  reason: r.reason ?? undefined,
  imageUrl: r.image_url ?? undefined,
  shopeeUrl: r.shopee_url,
  sort: r.sort,
  checkedAt: r.checked_at,
  published: r.published,
  updatedAt: r.updated_at,
})

/**
 * Published products in page order. Empty when Supabase isn't set up or the
 * products table hasn't been created yet (so the site still builds).
 */
export const listPublishedProducts = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await db()
    .from('products')
    .select('*')
    .eq('published', true)
    .order('sort')
    .order('name')
  if (error) {
    console.error('products:', error.message)
    return []
  }
  return (data as ProductRow[]).map(rowToProduct)
})

// Admin ---------------------------------------------------------------------

export async function listAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await db().from('products').select('*').order('group_slug').order('sort')
  if (error) throw error
  return (data as ProductRow[]).map(rowToProduct)
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data, error } = await db().from('products').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? rowToProduct(data as ProductRow) : undefined
}

export type ProductInput = Omit<ProductRow, 'id' | 'updated_at'> & { updated_by: string }

export async function upsertProduct(input: ProductInput, id?: string): Promise<string> {
  const q = id
    ? db().from('products').update(input).eq('id', id).select('id').single()
    : db().from('products').insert(input).select('id').single()
  const { data, error } = await q
  if (error) throw error
  return (data as { id: string }).id
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await db().from('products').delete().eq('id', id)
  if (error) throw error
}

/** Every product image URL, so photo cleanup keeps them. */
export async function productImageUrls(): Promise<string[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await db().from('products').select('image_url')
  // Before the products table exists there is nothing to keep.
  if (error) return []
  return (data as { image_url: string | null }[]).flatMap((r) => (r.image_url ? [r.image_url] : []))
}
