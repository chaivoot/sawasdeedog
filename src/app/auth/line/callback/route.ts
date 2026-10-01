import { NextResponse, type NextRequest } from 'next/server'
import { callbackUrl, exchangeCode } from '@/lib/line'
import { safeNext, sessionCookie, verify } from '@/lib/session'

const OAUTH_COOKIE = 'sd_oauth'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const saved = verify<{ state: string; nonce: string; next: string }>(
    request.cookies.get(OAUTH_COOKIE)?.value,
  )
  const fail = () => {
    const res = NextResponse.redirect(new URL('/submit?error=line', request.url))
    res.cookies.delete(OAUTH_COOKIE)
    return res
  }

  const code = params.get('code')
  if (!saved || !code || params.get('state') !== saved.state) return fail()

  try {
    const profile = await exchangeCode(code, callbackUrl(request.url), saved.nonce)
    const res = NextResponse.redirect(new URL(safeNext(saved.next), request.url))
    res.cookies.delete(OAUTH_COOKIE)
    res.cookies.set(
      sessionCookie({ sub: profile.sub, name: profile.name ?? 'ผู้ใช้ LINE', picture: profile.picture }),
    )
    return res
  } catch (err) {
    console.error(err)
    return fail()
  }
}
