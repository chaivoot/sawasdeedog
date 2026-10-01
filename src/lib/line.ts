import 'server-only'

// LINE Login v2.1 (https://developers.line.biz/en/docs/line-login/integrate-line-login/)
export const LINE_AUTHORIZE_URL = 'https://access.line.me/oauth2/v2.1/authorize'
const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token'
const LINE_VERIFY_URL = 'https://api.line.me/oauth2/v2.1/verify'

export function lineConfig() {
  const channelId = process.env.LINE_CHANNEL_ID
  const channelSecret = process.env.LINE_CHANNEL_SECRET
  return channelId && channelSecret ? { channelId, channelSecret } : undefined
}

/**
 * Canonical origin from SITE_URL, tolerant of a missing scheme or a trailing
 * path ("sawasdeedog.com/" -> "https://sawasdeedog.com"). Undefined if unset.
 */
export function siteOrigin(): string | undefined {
  const raw = process.env.SITE_URL?.trim()
  if (!raw) return undefined
  try {
    return new URL(/^https?:\/\//.test(raw) ? raw : `https://${raw}`).origin
  } catch {
    return undefined
  }
}

/** The redirect_uri sent to LINE; must match a Callback URL in the channel exactly. */
export function callbackUrl(requestUrl: string) {
  return new URL('/auth/line/callback', siteOrigin() ?? new URL(requestUrl).origin).toString()
}

type IdToken = { sub: string; name?: string; picture?: string; nonce?: string }

/** Exchanges the authorization code and verifies the ID token with LINE. */
export async function exchangeCode(code: string, redirectUri: string, nonce: string): Promise<IdToken> {
  const config = lineConfig()
  if (!config) throw new Error('LINE Login is not configured')

  const tokenRes = await fetch(LINE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: config.channelId,
      client_secret: config.channelSecret,
    }),
  })
  if (!tokenRes.ok) throw new Error(`token exchange ${tokenRes.status} ${await tokenRes.text()}`)
  const { id_token } = (await tokenRes.json()) as { id_token?: string }
  if (!id_token) throw new Error('LINE did not return an id_token (is the openid scope enabled?)')

  const verifyRes = await fetch(LINE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id_token, client_id: config.channelId, nonce }),
  })
  if (!verifyRes.ok) throw new Error(`id_token verify ${verifyRes.status} ${await verifyRes.text()}`)
  return (await verifyRes.json()) as IdToken
}
