import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleBody } from '@/components/ArticleBody'
import { Breadcrumb } from '@/components/Breadcrumb'
import { JsonLd } from '@/components/JsonLd'
import { SiteHeader } from '@/components/SiteHeader'
import { readingMinutes } from '@/lib/article-body'
import { getPublishedArticle } from '@/lib/articles'
import { formatDay } from '@/lib/format'
import { SITE_NAME, absoluteUrl } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getPublishedArticle((await params).slug)
  if (!a) return {}
  return {
    title: a.title,
    description: a.excerpt,
    alternates: { canonical: `/stories/${a.slug}` },
    openGraph: {
      type: 'article',
      title: a.title,
      description: a.excerpt,
      images: a.coverUrl ? [a.coverUrl] : undefined,
      publishedTime: a.publishedAt,
    },
  }
}

export default async function StoryPage({ params }: Props) {
  const a = await getPublishedArticle((await params).slug)
  if (!a) notFound()
  const url = absoluteUrl(`/stories/${a.slug}`)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: a.title,
          description: a.excerpt,
          image: a.coverUrl ? [a.coverUrl] : undefined,
          datePublished: a.publishedAt,
          dateModified: a.updatedAt,
          author: { '@type': a.author ? 'Person' : 'Organization', name: a.author ?? SITE_NAME },
          publisher: { '@type': 'Organization', name: SITE_NAME },
          mainEntityOfPage: url,
        }}
      />
      <SiteHeader back="/stories" />
      <main className="prose-page article">
        <Breadcrumb
          items={[
            { label: 'หน้าแรก', href: '/' },
            { label: 'เรื่องหมาๆ', href: '/stories' },
            { label: a.title },
          ]}
        />
        <header className="article__head">
          <h1>{a.title}</h1>
          <span className="article__meta">
            {[
              a.author,
              a.publishedAt && formatDay(a.publishedAt.slice(0, 10)),
              `อ่าน ${readingMinutes(a.body)} นาที`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </header>
        {a.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- uploaded article cover
          <img className="article__cover" src={a.coverUrl} alt="" />
        )}
        <ArticleBody body={a.body} />
      </main>
    </>
  )
}
