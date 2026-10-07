'use server'

import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import {
  dueUrls,
  inScope,
  inspectAndStore,
  listIndexStatus,
  sitemapUrls,
  type IndexScope,
} from '@/lib/index-status'

/** Pages per click: five at a time stays well inside the function time limit and the API's 600/minute. */
const INSPECT_BATCH = 30

export async function inspectBatchAction(form: FormData) {
  await requireAdmin()
  const scope: IndexScope = form.get('scope') === 'all' ? 'all' : 'place'
  let checked = 0
  let failed = ''
  try {
    const [urls, statuses] = await Promise.all([sitemapUrls(), listIndexStatus()])
    checked = await inspectAndStore(
      dueUrls(
        urls.filter((u) => inScope(u, scope)),
        statuses,
      ),
      INSPECT_BATCH,
    )
  } catch (e) {
    failed = e instanceof Error ? e.message : String(e)
  }
  redirect(
    failed
      ? `/admin/search?scope=${scope}&failed=${encodeURIComponent(failed)}#index`
      : `/admin/search?scope=${scope}&checked=${checked}#index`,
  )
}
