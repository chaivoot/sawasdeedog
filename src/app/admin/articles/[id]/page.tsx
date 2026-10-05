import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleBody } from '@/components/ArticleBody'
import { ConfirmSubmit } from '@/components/ConfirmSubmit'
import { requireAdminPage } from '@/lib/admin-page'
import { getArticleById } from '@/lib/articles'
import { deleteArticleAction } from '../actions'
import { ArticleEditor } from '../ArticleEditor'

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }

export default async function EditArticle({ params, searchParams }: Props) {
  await requireAdminPage()
  const a = await getArticleById((await params).id)
  if (!a) notFound()
  const { saved } = await searchParams

  return (
    <>
      <div className="admin-titlebar">
        <h1>แก้ไขบทความ</h1>
        {a.published && (
          <Link href={`/stories/${a.slug}`} className="btn btn--secondary btn--sm">
            ดูบนเว็บ
          </Link>
        )}
      </div>
      {saved && <p className="admin-notice">บันทึกแล้ว</p>}
      <ArticleEditor
        key={a.updatedAt}
        draft={{
          id: a.id,
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt ?? '',
          coverUrl: a.coverUrl ?? '',
          body: a.body,
          author: a.author ?? '',
          published: a.published,
        }}
      />
      <section className="admin-fieldset admin-article-preview">
        <h2>ตัวอย่าง (จากที่บันทึกล่าสุด)</h2>
        <h1>{a.title}</h1>
        <ArticleBody body={a.body} />
      </section>
      <form action={deleteArticleAction} className="admin-danger">
        <input type="hidden" name="id" value={a.id} />
        <ConfirmSubmit message={`ลบบทความ “${a.title}” ถาวร?`}>ลบบทความนี้</ConfirmSubmit>
      </form>
    </>
  )
}
