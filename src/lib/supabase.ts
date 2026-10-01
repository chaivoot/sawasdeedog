import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const PLACE_PHOTOS_BUCKET = 'place-photos'
export const SUBMISSION_PHOTOS_BUCKET = 'submission-photos'

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
