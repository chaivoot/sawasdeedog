import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyState } from '@/components/EmptyState'
import { SiteHeader } from '@/components/SiteHeader'
import { listPublishedArticles } from '@/lib/articles'
import { formatDay } from '@/lib/format'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const articles = await listPublishedArticles()
  return {
    title: 'เรื่องหมาๆ',
    description: 'เรื่องเล่า ทริป และเคล็ดลับการใช้ชีวิตกับน้องหมา จากทีม SawasdeeDog',
    alternates: { canonical: '/stories' },
    // Kept out of search until there is something to read.
    robots: articles.length === 0 ? { index: false, follow: true } : undefined,
  }
}

/** Articles about life with dogs, newest first. */
export default async function StoriesPage() {
  const articles = await listPublishedArticles()
  return (
    <>
      <SiteHeader back="/" />
      <main className="prose-page">
        <div className="prose-page__intro">
          <span className="eyebrow">บทความ</span>
          <h1>เรื่องหมาๆ</h1>
          <p>เรื่องเล่า ทริป และเคล็ดลับการใช้ชีวิตกับน้องหมา จากทีม SawasdeeDog</p>
        </div>
        {articles.length > 0 ? (
          <div className="story-list">
            {articles.map((a) => (
              <Link key={a.id} href={`/stories/${a.slug}`} className="story-card">
                {a.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- uploaded article covers
                  <img className="story-card__cover" src={a.coverUrl} alt="" loading="lazy" />
                )}
                <span className="story-card__text">
                  <span className="story-card__title">{a.title}</span>
                  {a.excerpt && <span className="story-card__excerpt">{a.excerpt}</span>}
                  {a.publishedAt && (
                    <span className="story-card__date">{formatDay(a.publishedAt.slice(0, 10))}</span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            compact
            title="บทความแรกกำลังมา"
            body="ระหว่างนี้ อ่านได้ว่าเราคัดสถานที่ยังไง"
            primary={{ href: '/criteria', label: 'อ่านเกณฑ์การคัดเลือก' }}
            secondary={{ href: '/', label: 'กลับหน้าแรก' }}
          />
        )}
      </main>
    </>
  )
}
