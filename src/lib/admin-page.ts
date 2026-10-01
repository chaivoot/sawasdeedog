import 'server-only'
import { redirect } from 'next/navigation'
import { isAdmin } from './admin'
import { getSession } from './session'

/** Every /admin page calls this; layouts alone aren't a security boundary. */
export async function requireAdminPage() {
  const session = await getSession()
  if (!session || !isAdmin(session)) redirect('/admin')
  return session
}
