'use server'

import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { dueUrls, inspectAndStore, listIndexStatus, sitemapUrls } from '@/lib/index-status'

/** Pages per click: five at a time stays well inside the function time limit and the API's 600/minute. */
const INSPECT_BATCH = 40

export async function inspectBatchAction() {
  await requireAdmin()
  let checked = 0
  let failed = ''
  try {
    const [urls, statuses] = await Promise.all([sitemapUrls(), listIndexStatus()])
    checked = await inspectAndStore(dueUrls(urls, statuses), INSPECT_BATCH)
  } catch (e) {
    failed = e instanceof Error ? e.message : String(e)
  }
  redirect(
    failed ? `/admin/search?failed=${encodeURIComponent(failed)}` : `/admin/search?checked=${checked}#index`,
  )
}
