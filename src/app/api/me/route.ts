import { isAdmin } from '@/lib/admin'
import { getSession } from '@/lib/session'

// Public pages are cached for everyone, so they ask this per visitor instead.
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  return Response.json({ admin: isAdmin(session) }, { headers: { 'Cache-Control': 'private, no-store' } })
}
