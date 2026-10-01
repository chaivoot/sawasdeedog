import { randomBytes } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { LINE_AUTHORIZE_URL, callbackUrl, lineConfig } from '@/lib/line'
import { cookieOptions, safeNext, sessionCookie, sign } from '@/lib/session'

const OAUTH_COOKIE = 'sd_oauth'

export function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get('next'))
  const config = lineConfig()

  if (!config) {
    // Without LINE credentials, local development signs in as a test user so
    // the submit form can be worked on. Production refuses.
    if (process.env.NODE_ENV !== 'production') {
      const res = NextResponse.redirect(new URL(next, request.url))
      res.cookies.set(sessionCookie({ sub: 'dev-user', name: 'ผู้ทดสอบ (dev)' }))
      return res
    }
    return NextResponse.redirect(new URL('/submit?error=line', request.url))
  }

  const state = randomBytes(16).toString('base64url')
  const nonce = randomBytes(16).toString('base64url')
  const url = new URL(LINE_AUTHORIZE_URL)
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: config.channelId,
    redirect_uri: callbackUrl(request.url),
    state,
    scope: 'profile openid',
    nonce,
  }).toString()

  const res = NextResponse.redirect(url)
  res.cookies.set({
    name: OAUTH_COOKIE,
    value: sign({ state, nonce, next }),
    ...cookieOptions,
    maxAge: 600,
  })
  return res
}
