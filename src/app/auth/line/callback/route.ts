import { NextResponse, type NextRequest } from 'next/server'
import { callbackUrl, exchangeCode } from '@/lib/line'
import { safeNext, sessionCookie, verify } from '@/lib/session'

const OAUTH_COOKIE = 'sd_oauth'

export async function GET(request: NextRequest) {
  try {
    return await finish(request)
  } catch (err) {
    console.error('[line-login] unexpected error in callback', err)
    return NextResponse.redirect(new URL('/submit?error=server', request.url))
  }
}

async function finish(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const fail = (code: string, detail: string) => {
    console.error(`[line-login] ${code}: ${detail}`)
    const res = NextResponse.redirect(new URL(`/submit?error=${code}`, request.url))
    res.cookies.delete(OAUTH_COOKIE)
    return res
  }

  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    return fail('session_config', 'SESSION_SECRET not set')
  }

  // User pressed cancel on LINE, or LINE rejected the request.
  const lineError = params.get('error')
  if (lineError) {
    return fail(
      lineError === 'access_denied' ? 'line_cancel' : 'line_denied',
      `${lineError} ${params.get('error_description') ?? ''}`,
    )
  }

  const saved = verify<{ state: string; nonce: string; next: string }>(
    request.cookies.get(OAUTH_COOKIE)?.value,
  )
  const code = params.get('code')
  if (!code) return fail('line_state', 'no code in callback')
  if (!saved) return fail('line_state', `no oauth cookie on ${request.nextUrl.host}`)
  if (params.get('state') !== saved.state) return fail('line_state', 'state mismatch')

  try {
    const profile = await exchangeCode(code, callbackUrl(request.url), saved.nonce)
    const res = NextResponse.redirect(new URL(safeNext(saved.next), request.url))
    res.cookies.delete(OAUTH_COOKIE)
    res.cookies.set(
      sessionCookie({ sub: profile.sub, name: profile.name ?? 'ผู้ใช้ LINE', picture: profile.picture }),
    )
    return res
  } catch (err) {
    return fail('line_token', err instanceof Error ? err.message : String(err))
  }
}
