import Link from 'next/link'
import { requireAdminPage } from '@/lib/admin-page'
import { listAllArticles, type Article } from '@/lib/articles'
import { formatDay } from '@/lib/format'

export default async function AdminArticles() {
  await requireAdminPage()
  let articles: Article[] = []
  let missingTable = false
  try {
    articles = await listAllArticles()
  } catch {
    missingTable = true
  }

  return (
    <>
      <div className="admin-titlebar">
        <h1>บทความ (เรื่องหมาๆ)</h1>
        <Link href="/admin/articles/new" className="btn btn--primary btn--sm">
          + เขียนบทความ
        </Link>
      </div>
      {missingTable && (
        <p className="admin-warning">
          ยังไม่มีตาราง articles ใน Supabase ให้รัน supabase/migrations/0009_articles.sql ก่อน
        </p>
      )}
      {articles.length === 0 && !missingTable ? (
        <p>ยังไม่มีบทความ</p>
      ) : (
        <ul className="admin-list">
          {articles.map((a) => (
            <li key={a.id}>
              <Link href={`/admin/articles/${a.id}`} className="admin-row">
                <span className="admin-row__main">
                  <b>{a.title}</b>
                  <span>
                    {a.published ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'} · แก้ล่าสุด{' '}
                    {formatDay(a.updatedAt.slice(0, 10))}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
