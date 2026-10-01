import 'server-only'
import { getSession, type Session } from './session'

/** LINE user IDs (U...) allowed into /admin, from ADMIN_LINE_USER_IDS (comma separated). */
function adminIds() {
  return (process.env.ADMIN_LINE_USER_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function isAdmin(session?: Session) {
  if (!session) return false
  const ids = adminIds()
  // Local development without a list: the dev test user is an admin.
  if (ids.length === 0 && process.env.NODE_ENV !== 'production') return session.sub === 'dev-user'
  return ids.includes(session.sub)
}

/** For server actions: throws unless the caller is an admin. */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession()
  if (!session || !isAdmin(session)) throw new Error('Not allowed')
  return session
}
