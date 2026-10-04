import posthog from 'posthog-js'

// PostHog (EU cloud). The project key is public by design: it only lets a browser send
// events, never read them. NEXT_PUBLIC_POSTHOG_KEY overrides it, e.g. for a test project.
export const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ?? 'phc_xQt7LyMTwWSMGbcHposNdJGYtVVYKVZMqriGALPYGi6s'

/** Requests go through /ingest on our own domain (see next.config.ts) so ad blockers let them through. */
export const POSTHOG_PROXY = '/ingest'

// Only the live site is measured; previews, localhost and test builds send nothing.
const LIVE_HOSTS = new Set(['sawasdeedog.com', 'www.sawasdeedog.com'])

export const isLiveHost = (host: string) => LIVE_HOSTS.has(host)

/** The admin is never measured or recorded. */
export const isAdminPath = (path: string) => path === '/admin' || path.startsWith('/admin/')

// A browser that has opened the admin or is logged in as admin belongs to the team: it is
// never counted again, so our own visits don't skew the numbers. Clearing site data undoes it.
const TEAM_KEY = 'sd_team_device'

export function isTeamDevice() {
  try {
    return localStorage.getItem(TEAM_KEY) === '1'
  } catch {
    return false
  }
}

export function markTeamDevice() {
  try {
    localStorage.setItem(TEAM_KEY, '1')
  } catch {}
  if (posthog.__loaded) posthog.opt_out_capturing()
}

/** Records an event; does nothing when analytics is off (not the live site). */
export function track(event: string, props?: Record<string, string | number | boolean | undefined>) {
  if (posthog.__loaded) posthog.capture(event, props)
}
