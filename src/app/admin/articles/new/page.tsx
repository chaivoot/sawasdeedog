import { requireAdminPage } from '@/lib/admin-page'
import { ArticleEditor } from '../ArticleEditor'

export default async function NewArticle() {
  await requireAdminPage()
  return (
    <>
      <h1>เขียนบทความ</h1>
      <ArticleEditor
        draft={{ slug: '', title: '', excerpt: '', coverUrl: '', body: '', author: '', published: false }}
      />
    </>
  )
}
