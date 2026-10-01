import { NextResponse, type NextRequest } from 'next/server'
import { clearedSessionCookie } from '@/lib/session'

export function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL('/submit', request.url), 303)
  res.cookies.set(clearedSessionCookie)
  return res
}
