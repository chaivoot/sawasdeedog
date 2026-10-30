import { requireAdminPage } from '@/lib/admin-page'
import { nextArticleSlot } from '@/lib/articles'
import { toBangkokInput } from '@/lib/format'
import { ArticleEditor } from '../ArticleEditor'

export default async function NewArticle() {
  await requireAdminPage()
  const nextSlot = toBangkokInput(await nextArticleSlot())
  return (
    <>
      <h1>เขียนบทความ</h1>
      <ArticleEditor
        draft={{
          slug: '',
          title: '',
          excerpt: '',
          coverUrl: '',
          body: '',
          author: '',
          published: false,
          publishAt: '',
        }}
        nextSlot={nextSlot}
      />
    </>
  )
}
