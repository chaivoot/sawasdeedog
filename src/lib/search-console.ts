import 'server-only'
import { createSign } from 'node:crypto'
import { siteUrl } from './site'

/**
 * Google Search Console API, read-only, as a service account.
 * GSC_SERVICE_ACCOUNT_JSON holds the account's whole JSON key; the account is added as a
 * user on the Search Console property.
 */

type ServiceAccount = { client_email: string; private_key: string }

function account(): ServiceAccount | undefined {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON?.trim()
  if (!raw) return undefined
  try {
    const a = JSON.parse(raw) as Partial<ServiceAccount>
    return a.client_email && a.private_key
      ? { client_email: a.client_email, private_key: a.private_key }
      : undefined
  } catch {
    return undefined
  }
}

export function isSearchConsoleConfigured() {
  return Boolean(account())
}

export class SearchConsoleError extends Error {}

let token: { value: string; expires: number } | undefined

async function accessToken(): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value
  const a = account()
  if (!a)
    throw new SearchConsoleError(
      'ยังไม่ได้ตั้งค่า GSC_SERVICE_ACCOUNT_JSON หรือค่าไม่ใช่ JSON ของ Service Account',
    )
  const now = Math.floor(Date.now() / 1000)
  const b64 = (v: object) => Buffer.from(JSON.stringify(v)).toString('base64url')
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: a.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`
  const signature = createSign('RSA-SHA256').update(unsigned).sign(a.private_key, 'base64url')
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
    cache: 'no-store',
  })
  const json = (await res.json()) as {
    access_token?: string
    expires_in?: number
    error_description?: string
  }
  if (!res.ok || !json.access_token)
    throw new SearchConsoleError(`ขอสิทธิ์จาก Google ไม่ได้: ${json.error_description ?? res.status}`)
  token = { value: json.access_token, expires: Date.now() + (json.expires_in ?? 3600) * 1000 }
  return token.value
}

async function call<T>(url: string, body?: object): Promise<T> {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  })
  const json = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } }
  if (!res.ok) throw new SearchConsoleError(json.error?.message ?? `Search Console ตอบ ${res.status}`)
  return json
}

const API = 'https://www.googleapis.com/webmasters/v3'

let property: string | undefined

/**
 * The property this account can read for our domain: a Domain property
 * (sc-domain:example.com) or a URL-prefix one (https://example.com/).
 */
export async function searchConsoleProperty(): Promise<string> {
  if (property) return property
  const host = new URL(siteUrl()).hostname.replace(/^www\./, '')
  const { siteEntry = [] } = await call<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>(
    `${API}/sites`,
  )
  const usable = siteEntry.filter((s) => s.permissionLevel !== 'siteUnverifiedUser')
  const match =
    usable.find((s) => s.siteUrl === `sc-domain:${host}`) ??
    usable.find((s) => {
      try {
        return new URL(s.siteUrl).hostname.replace(/^www\./, '') === host
      } catch {
        return false
      }
    })
  if (!match)
    throw new SearchConsoleError(
      `Service Account ยังไม่มีสิทธิ์ใน property ของ ${host} (เพิ่มอีเมล Service Account ใน Search Console > Settings > Users and permissions)`,
    )
  property = match.siteUrl
  return property
}

export type SearchRow = { key: string; clicks: number; impressions: number; ctr: number; position: number }

const day = (d: Date) => d.toISOString().slice(0, 10)

/** Clicks/impressions for the last `days` days (Search data lags ~2 days), grouped by one dimension or none. */
export async function searchAnalytics(
  dimension: 'query' | 'page' | null,
  days = 28,
  rowLimit = 50,
): Promise<SearchRow[]> {
  const site = await searchConsoleProperty()
  const end = new Date(Date.now() - 2 * 86_400_000)
  const start = new Date(end.getTime() - (days - 1) * 86_400_000)
  const { rows = [] } = await call<{
    rows?: { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }[]
  }>(`${API}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    startDate: day(start),
    endDate: day(end),
    dimensions: dimension ? [dimension] : [],
    rowLimit,
    dataState: 'all',
  })
  return rows.map((r) => ({
    key: r.keys?.[0] ?? '',
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }))
}

export type Inspection = {
  url: string
  verdict: string | null
  coverageState: string | null
  robotsTxtState: string | null
  indexingState: string | null
  pageFetchState: string | null
  lastCrawlTime: string | null
  googleCanonical: string | null
  userCanonical: string | null
}

/** One page's index status (URL Inspection API: 2,000 a day, 600 a minute per property). */
export async function inspectUrl(url: string): Promise<Inspection> {
  const site = await searchConsoleProperty()
  const { inspectionResult } = await call<{
    inspectionResult?: {
      indexStatusResult?: {
        verdict?: string
        coverageState?: string
        robotsTxtState?: string
        indexingState?: string
        pageFetchState?: string
        lastCrawlTime?: string
        googleCanonical?: string
        userCanonical?: string
      }
    }
  }>('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    inspectionUrl: url,
    siteUrl: site,
    languageCode: 'th',
  })
  const s = inspectionResult?.indexStatusResult ?? {}
  return {
    url,
    verdict: s.verdict ?? null,
    coverageState: s.coverageState ?? null,
    robotsTxtState: s.robotsTxtState ?? null,
    indexingState: s.indexingState ?? null,
    pageFetchState: s.pageFetchState ?? null,
    lastCrawlTime: s.lastCrawlTime ?? null,
    googleCanonical: s.googleCanonical ?? null,
    userCanonical: s.userCanonical ?? null,
  }
}

/** Opens the page in Search Console's URL inspection, where "Request indexing" lives. */
export function inspectInConsoleUrl(site: string, url: string) {
  return `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(site)}&id=${encodeURIComponent(url)}`
}
