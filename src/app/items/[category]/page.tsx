import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/Breadcrumb'
import { EmptyState } from '@/components/EmptyState'
import { AffiliateNote, ProductCard } from '@/components/ProductCard'
import { SiteHeader } from '@/components/SiteHeader'
import { findItemCategory, itemCategories } from '@/data/item-categories'
import { listPublishedProducts } from '@/lib/products'

type Props = { params: Promise<{ category: string }> }

export const revalidate = 3600

export function generateStaticParams() {
  return itemCategories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = findItemCategory((await params).category)
  if (!c) return {}
  const products = (await listPublishedProducts()).filter((p) => p.category === c.slug)
  return {
    title: `${c.name} ครูฝึกแนะนำ`,
    description: `${c.blurb} ที่ครูฝึกเลือกจากการใช้จริง พร้อมเหตุผลที่เลือก`,
    alternates: { canonical: `/items/${c.slug}` },
    robots: products.length === 0 ? { index: false, follow: true } : undefined,
  }
}

/** Picks in one group; groups with subtypes (food: kibble, wet…) list them under their own headings. */
export default async function ItemCategoryPage({ params }: Props) {
  const c = findItemCategory((await params).category)
  if (!c) notFound()
  const products = (await listPublishedProducts()).filter((p) => p.category === c.slug)
  const sections = c.subcategories.length
    ? [
        ...c.subcategories.map((s) => ({
          key: s.slug,
          title: s.name,
          items: products.filter((p) => p.subcategory === s.slug),
        })),
        {
          key: 'other',
          title: 'อื่น ๆ',
          items: products.filter((p) => !c.subcategories.some((s) => s.slug === p.subcategory)),
        },
      ].filter((s) => s.items.length > 0)
    : [{ key: 'all', title: '', items: products }]

  return (
    <>
      <SiteHeader back="/items" />
      <main className="prose-page">
        <Breadcrumb
          items={[{ label: 'หน้าแรก', href: '/' }, { label: 'ไอเทม', href: '/items' }, { label: c.name }]}
        />
        <div className="prose-page__intro">
          <span className="eyebrow">ไอเทม</span>
          <h1>{c.name} ครูฝึกแนะนำ</h1>
          <p>{c.blurb}</p>
        </div>
        {products.length > 0 ? (
          <>
            {sections.length > 1 && (
              <nav className="chip-row" aria-label="ประเภท">
                {sections.map((s) => (
                  <a key={s.key} href={`#${s.key}`} className="chip">
                    {s.title} ({s.items.length})
                  </a>
                ))}
              </nav>
            )}
            {sections.map((s) => (
              <section key={s.key} id={s.key} className="product-section">
                {sections.length > 1 && <h2>{s.title}</h2>}
                <div className="product-list">
                  {s.items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            ))}
            <AffiliateNote />
          </>
        ) : (
          <EmptyState
            compact
            title="ครูกำลังคัดอยู่"
            body="ระหว่างนี้ ดูหมวดอื่นก่อนได้"
            primary={{ href: '/items', label: 'ดูไอเทมทั้งหมด' }}
            secondary={{ href: '/', label: 'กลับหน้าแรก' }}
          />
        )}
      </main>
    </>
  )
}
