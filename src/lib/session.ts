import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export type Session = { sub: string; name: string; picture?: string }

const SESSION_COOKIE = 'sd_session'
const MAX_AGE = 60 * 60 * 24 * 30

function secret() {
  const s = process.env.SESSION_SECRET
  if (s) return s
  if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET is not set')
  return 'dev-only-session-secret'
}

export function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const mac = createHmac('sha256', secret()).update(body).digest('base64url')
  return `${body}.${mac}`
}

export function verify<T>(token: string | undefined): T | undefined {
  if (!token) return undefined
  const [body, mac] = token.split('.')
  if (!body || !mac) return undefined
  const expected = createHmac('sha256', secret()).update(body).digest()
  const given = Buffer.from(mac, 'base64url')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return undefined
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString()) as T
  } catch {
    return undefined
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export async function getSession(): Promise<Session | undefined> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return undefined
  let s: (Session & { exp: number }) | undefined
  try {
    s = verify<Session & { exp: number }>(token)
  } catch (err) {
    console.error('[session] cannot verify session cookie', err)
    return undefined
  }
  if (!s || s.exp < Date.now()) return undefined
  return { sub: s.sub, name: s.name, picture: s.picture }
}

export function sessionCookie(session: Session) {
  return {
    name: SESSION_COOKIE,
    value: sign({ ...session, exp: Date.now() + MAX_AGE * 1000 }),
    ...cookieOptions,
    maxAge: MAX_AGE,
  }
}

export const clearedSessionCookie = { name: SESSION_COOKIE, value: '', ...cookieOptions, maxAge: 0 }

/** Only allow same-site relative redirects. */
export function safeNext(next: string | null | undefined, fallback = '/submit') {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : fallback
}
