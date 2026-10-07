import 'server-only'
import sitemap from '@/app/sitemap'
import { inspectUrl, SearchConsoleError } from './search-console'
import { db } from './supabase'

export type IndexStatus = {
  url: string
  verdict: string | null
  coverageState: string | null
  robotsTxtState: string | null
  indexingState: string | null
  pageFetchState: string | null
  lastCrawlTime: string | null
  googleCanonical: string | null
  userCanonical: string | null
  error: string | null
  checkedAt: string
}

type Row = {
  url: string
  verdict: string | null
  coverage_state: string | null
  robots_txt_state: string | null
  indexing_state: string | null
  page_fetch_state: string | null
  last_crawl_time: string | null
  google_canonical: string | null
  user_canonical: string | null
  error: string | null
  checked_at: string
}

const fromRow = (r: Row): IndexStatus => ({
  url: r.url,
  verdict: r.verdict,
  coverageState: r.coverage_state,
  robotsTxtState: r.robots_txt_state,
  indexingState: r.indexing_state,
  pageFetchState: r.page_fetch_state,
  lastCrawlTime: r.last_crawl_time,
  googleCanonical: r.google_canonical,
  userCanonical: r.user_canonical,
  error: r.error,
  checkedAt: r.checked_at,
})

/** Which pages the admin is looking at: place detail pages only, or the whole sitemap. */
export type IndexScope = 'place' | 'all'

export function isPlaceUrl(url: string): boolean {
  try {
    return new URL(url).pathname.startsWith('/place/')
  } catch {
    return false
  }
}

export const inScope = (url: string, scope: IndexScope) => scope === 'all' || isPlaceUrl(url)

/** Every page we ask Google to index: the sitemap. */
export async function sitemapUrls(): Promise<string[]> {
  return (await sitemap()).map((u) => u.url)
}

export async function listIndexStatus(): Promise<IndexStatus[]> {
  const { data, error } = await db().from('index_status').select('*')
  if (error) throw error
  return (data as Row[]).map(fromRow)
}

const DAY = 86_400_000

/** Indexed pages are re-checked every two weeks, the rest every few days, failed checks daily. */
function due(s: IndexStatus | undefined, now: number): boolean {
  if (!s) return true
  const age = now - new Date(s.checkedAt).getTime()
  if (s.error) return age > DAY
  if (s.verdict === 'PASS') return age > 14 * DAY
  return age > 3 * DAY
}

/** URLs to check next: place pages before the rest, never-checked first, then the oldest results. */
export function dueUrls(urls: string[], statuses: IndexStatus[], now = Date.now()): string[] {
  const byUrl = new Map(statuses.map((s) => [s.url, s]))
  return urls
    .filter((u) => due(byUrl.get(u), now))
    .sort(
      (a, b) =>
        Number(isPlaceUrl(b)) - Number(isPlaceUrl(a)) ||
        (byUrl.get(a)?.checkedAt ?? '').localeCompare(byUrl.get(b)?.checkedAt ?? ''),
    )
}

/** Inspects up to `limit` URLs, a few at a time, and stores each result. Returns how many were checked. */
export async function inspectAndStore(urls: string[], limit: number): Promise<number> {
  const batch = urls.slice(0, limit)
  let done = 0
  for (let i = 0; i < batch.length; i += 5) {
    const results = await Promise.all(
      batch.slice(i, i + 5).map(async (url): Promise<Row> => {
        const now = new Date().toISOString()
        try {
          const r = await inspectUrl(url)
          return {
            url,
            verdict: r.verdict,
            coverage_state: r.coverageState,
            robots_txt_state: r.robotsTxtState,
            indexing_state: r.indexingState,
            page_fetch_state: r.pageFetchState,
            last_crawl_time: r.lastCrawlTime,
            google_canonical: r.googleCanonical,
            user_canonical: r.userCanonical,
            error: null,
            checked_at: now,
          }
        } catch (e) {
          // Setup problems (no key, no permission) stop the run instead of being stored per page.
          if (e instanceof SearchConsoleError && /สิทธิ์|ตั้งค่า/.test(e.message)) throw e
          return {
            url,
            verdict: null,
            coverage_state: null,
            robots_txt_state: null,
            indexing_state: null,
            page_fetch_state: null,
            last_crawl_time: null,
            google_canonical: null,
            user_canonical: null,
            error: e instanceof Error ? e.message : String(e),
            checked_at: now,
          }
        }
      }),
    )
    const { error } = await db().from('index_status').upsert(results)
    if (error) throw error
    done += results.length
  }
  return done
}
