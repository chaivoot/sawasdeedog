import 'server-only'
import { cache } from 'react'
import { todayInBangkok } from './format'
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
  /**
   * ISO timestamp the article goes live; set the first time it is published, or chosen ahead
   * of time to schedule it. A published article stays off the site until then.
   */
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
    .lte('published_at', new Date().toISOString())
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
    .lte('published_at', new Date().toISOString())
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
  /** When it goes live (ISO); unset keeps the time it first went live, or now. */
  publish_at?: string
  updated_by: string
}

/**
 * Saves an article. The publish time is the one chosen (in the future, this schedules it), else
 * the time it first went live, else now when it is published now.
 */
export async function upsertArticle({ publish_at, ...input }: ArticleInput, id?: string): Promise<string> {
  const before = id ? await getArticleById(id) : undefined
  const now = new Date()
  // A cleared schedule on a published article means now, not the old future time.
  const kept =
    before?.publishedAt && (Date.parse(before.publishedAt) <= now.getTime() || !input.published)
      ? before.publishedAt
      : undefined
  const row = {
    ...input,
    published_at: publish_at ?? kept ?? (input.published ? now.toISOString() : null),
  }
  const q = id
    ? db().from('articles').update(row).eq('id', id).select('id').single()
    : db().from('articles').insert(row).select('id').single()
  const { data, error } = await q
  if (error) throw error
  return (data as { id: string }).id
}

/** Published, but set to go live later. */
export function isScheduled(a: Article): boolean {
  return a.published && !!a.publishedAt && Date.parse(a.publishedAt) > Date.now()
}

/**
 * The next free day for a scheduled article, 09:00 Bangkok: the day after the latest
 * publish time, and never earlier than tomorrow.
 */
export async function nextArticleSlot(): Promise<string> {
  const { data } = await db()
    .from('articles')
    .select('published_at')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(1)
  const latest = (data as { published_at: string }[] | null)?.[0]?.published_at
  const DAY = 24 * 60 * 60 * 1000
  const from = Math.max(Date.now(), latest ? Date.parse(latest) : 0) + DAY
  return new Date(`${todayInBangkok(new Date(from))}T09:00:00+07:00`).toISOString()
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
