import posthog from 'posthog-js'
import { POSTHOG_KEY, POSTHOG_PROXY, isAdminPath, isLiveHost, track } from '@/lib/analytics'

if (POSTHOG_KEY && isLiveHost(window.location.hostname)) {
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_PROXY,
      ui_host: 'https://eu.posthog.com',
      defaults: '2026-05-30',
      // Visitors are never identified, so no person profiles are needed.
      person_profiles: 'identified_only',
      session_recording: { maskAllInputs: true },
      before_send: (event) => (event && isAdminPath(window.location.pathname) ? null : event),
    })
  } catch {
    // Analytics must never break the site.
  }
}

// Server-rendered links say what they are with data-track="event" plus data-* properties,
// so pages need no client code to be measured.
document.addEventListener(
  'click',
  (e) => {
    const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-track]')
    if (!el) return
    const { track: event, ...props } = el.dataset
    if (event) track(event, props)
  },
  { capture: true },
)
