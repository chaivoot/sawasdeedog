import 'server-only'
import { cache } from 'react'
import { db, isSupabaseConfigured } from './supabase'

export type Article = {
  id: string
  slug: string
  title: string
  excerpt?: string
  coverUrl?: string
  body: string
  author?: string
  published: boolean
  /** ISO timestamp; set the first time the article is published. */
  publishedAt?: string
  updatedAt: string
}

type ArticleRow = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_url: string | null
  body: string
  author: string | null
  published: boolean
  published_at: string | null
  updated_at: string
}

function rowToArticle(r: ArticleRow): Article {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? undefined,
    coverUrl: r.cover_url ?? undefined,
    body: r.body,
    author: r.author ?? undefined,
    published: r.published,
    publishedAt: r.published_at ?? undefined,
    updatedAt: r.updated_at,
  }
}

/**
 * Published articles, newest first. Empty when Supabase isn't set up or the
 * articles table hasn't been created yet (so the site still builds).
 */
export const listPublishedArticles = cache(async (): Promise<Article[]> => {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await db()
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (error) {
    console.error('articles:', error.message)
    return []
  }
  return (data as ArticleRow[]).map(rowToArticle)
})

export const getPublishedArticle = cache(async (slug: string): Promise<Article | undefined> => {
  if (!isSupabaseConfigured()) return undefined
  const { data, error } = await db()
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  if (error) {
    console.error('articles:', error.message)
    return undefined
  }
  return data ? rowToArticle(data as ArticleRow) : undefined
})

// Admin ---------------------------------------------------------------------

export async function listAllArticles(): Promise<Article[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await db().from('articles').select('*').order('updated_at', { ascending: false })
  if (error) throw error
  return (data as ArticleRow[]).map(rowToArticle)
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const { data, error } = await db().from('articles').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? rowToArticle(data as ArticleRow) : undefined
}

export async function articleSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
  let q = db().from('articles').select('id', { count: 'exact', head: true }).eq('slug', slug)
  if (exceptId) q = q.neq('id', exceptId)
  const { count, error } = await q
  if (error) throw error
  return (count ?? 0) > 0
}

export type ArticleInput = {
  slug: string
  title: string
  excerpt: string | null
  cover_url: string | null
  body: string
  author: string | null
  published: boolean
  updated_by: string
}

/** Saves an article; the publish time is set the first time it goes live and kept after. */
export async function upsertArticle(input: ArticleInput, id?: string): Promise<string> {
  const before = id ? await getArticleById(id) : undefined
  const row = {
    ...input,
    published_at: input.published
      ? (before?.publishedAt ?? new Date().toISOString())
      : (before?.publishedAt ?? null),
  }
  const q = id
    ? db().from('articles').update(row).eq('id', id).select('id').single()
    : db().from('articles').insert(row).select('id').single()
  const { data, error } = await q
  if (error) throw error
  return (data as { id: string }).id
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await db().from('articles').delete().eq('id', id)
  if (error) throw error
}

/** Every image URL any article uses (cover and body), so photo cleanup keeps them. */
export async function articleImageUrls(): Promise<string[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await db().from('articles').select('cover_url, body')
  // Before the articles table exists there is nothing to keep.
  if (error) return []
  const urls: string[] = []
  for (const r of data as { cover_url: string | null; body: string }[]) {
    if (r.cover_url) urls.push(r.cover_url)
    for (const m of r.body.matchAll(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g)) urls.push(m[1])
  }
  return urls
}
