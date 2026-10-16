import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/Breadcrumb'
import { AffiliateNote, ProductCard, ProductPhoto } from '@/components/ProductCard'
import { SiteHeader } from '@/components/SiteHeader'
import { findItemCategory, findItemSubcategory } from '@/data/item-categories'
import { authorProfile } from '@/lib/authors'
import { getPublishedProduct, listPublishedProducts, productPath } from '@/lib/products'
import { shopName } from '@/lib/shop-links'

type Props = { params: Promise<{ category: string; slug: string }> }

export const revalidate = 3600

/** A paragraph starting with this is shown as a warning box. */
const CAVEAT = /^ข้อควรรู้\s*[:：]\s*/

function excerpt(text: string | undefined, max = 150): string | undefined {
  const flat = text?.replace(/\s+/g, ' ').trim()
  if (!flat) return undefined
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const p = await getPublishedProduct(category, slug)
  if (!p) return {}
  const by = p.recommendedBy ? ` รีวิวจาก${p.recommendedBy}` : ''
  return {
    title: `${p.brand ? `${p.brand} ` : ''}${p.name}${by}`,
    description: excerpt(p.reason),
    alternates: { canonical: productPath(p) },
    openGraph: { images: p.imageUrl ? [p.imageUrl] : undefined },
  }
}

/** One recommended item: photo, the trainer's review, and where to buy. */
export default async function ItemPage({ params }: Props) {
  const { category, slug } = await params
  const c = findItemCategory(category)
  const p = c && (await getPublishedProduct(category, slug))
  if (!c || !p) notFound()
  const sub = p.subcategory ? findItemSubcategory(c.slug, p.subcategory) : undefined
  const profile = authorProfile(p.recommendedBy)
  const paragraphs = (p.reason ?? '')
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean)
  const others = (await listPublishedProducts())
    .filter((o) => o.category === c.slug && o.id !== p.id)
    .slice(0, 4)

  return (
    <>
      <SiteHeader back={`/items/${c.slug}`} />
      <main className="prose-page item-page">
        <Breadcrumb
          items={[
            { label: 'หน้าแรก', href: '/' },
            { label: 'ไอเทม', href: '/items' },
            { label: c.name, href: `/items/${c.slug}` },
            { label: p.name },
          ]}
        />
        <ProductPhoto product={p} className="item-page__photo" />
        <header className="item-page__head">
          <span className="eyebrow">{[p.brand, sub?.name ?? c.name].filter(Boolean).join(' · ')}</span>
          <h1>{p.name}</h1>
          {p.recommendedBy && (
            <span className="article__meta">
              รีวิวโดย{' '}
              {profile ? (
                <a href={profile.url} target="_blank" rel="noopener author">
                  {p.recommendedBy}
                </a>
              ) : (
                p.recommendedBy
              )}
            </span>
          )}
        </header>
        {paragraphs.map((t, i) =>
          CAVEAT.test(t) ? (
            <aside key={i} className="item-page__caveat">
              <b>ข้อควรรู้</b>
              <p>{t.replace(CAVEAT, '')}</p>
            </aside>
          ) : (
            <p key={i} className="item-page__text">
              {t}
            </p>
          ),
        )}
        {(p.buyUrl || p.priceNote) && (
          <div className="item-page__buy">
            {p.priceNote && <span className="item-page__price">{p.priceNote}</span>}
            {p.buyUrl && (
              <a
                className="btn btn--primary"
                href={p.buyUrl}
                target="_blank"
                rel="sponsored nofollow noopener"
              >
                ดูที่ {shopName(p.buyUrl)} ↗
              </a>
            )}
          </div>
        )}
        {p.buyUrl && <AffiliateNote />}
        {others.length > 0 && (
          <section className="product-section item-page__more">
            <h2>{c.name}อื่น ๆ ที่ครูแนะนำ</h2>
            <div className="product-list">
              {others.map((o) => (
                <ProductCard key={o.id} product={o} />
              ))}
            </div>
            <Link href={`/items/${c.slug}`} className="btn btn--secondary btn--sm">
              ดู{c.name}ทั้งหมด
            </Link>
          </section>
        )}
      </main>
    </>
  )
}
