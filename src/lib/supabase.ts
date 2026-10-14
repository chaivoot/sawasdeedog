import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export { PLACE_PHOTOS_BUCKET, SUBMISSION_PHOTOS_BUCKET } from './supabase-names'

let client: SupabaseClient | undefined

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

/** Server-only client with the service-role key. Never import from client code. */
export function db(): SupabaseClient {
  if (!isSupabaseConfigured())
    throw new Error('Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}

type Page<T> = PromiseLike<{ data: T[] | null; error: unknown }>

/**
 * Every row a query matches. One request returns at most the API's row cap (1000 by default on
 * Supabase), so this pages with range() until a page comes back empty. The query needs a stable,
 * unique order (end it with `.order('id')`) or rows can repeat or go missing between pages.
 */
export async function allRows<T>(query: (from: number, to: number) => Page<T>): Promise<T[]> {
  const rows: T[] = []
  for (;;) {
    const { data, error } = await query(rows.length, rows.length + 999)
    if (error) throw error
    if (!data?.length) return rows
    rows.push(...data)
  }
}
