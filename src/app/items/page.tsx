import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { SiteHeader } from '@/components/SiteHeader'
import { itemCategories } from '@/data/item-categories'
import { listPublishedProducts } from '@/lib/products'

export const revalidate = 3600

const DESCRIPTION = 'อาหาร ของเล่น ขนม และอุปกรณ์สำหรับน้องหมา ที่ครูฝึกเลือกจากการใช้จริง'

export async function generateMetadata(): Promise<Metadata> {
  const products = await listPublishedProducts()
  return {
    title: 'ไอเทมน้องหมา ครูฝึกแนะนำ',
    description: DESCRIPTION,
    alternates: { canonical: '/items' },
    // Kept out of search until there is something to show.
    robots: products.length === 0 ? { index: false, follow: true } : undefined,
  }
}

/** Directory of item groups, each with how many picks it has. */
export default async function ItemsPage() {
  const counts = new Map<string, number>()
  for (const p of await listPublishedProducts()) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)

  return (
    <>
      <SiteHeader back="/" />
      <main className="prose-page">
        <div className="prose-page__intro">
          <span className="eyebrow">ไอเทม</span>
          <h1>ไอเทมน้องหมา ครูฝึกแนะนำ</h1>
          <p>{DESCRIPTION}</p>
        </div>
        <div className="item-groups">
          {itemCategories.map((c) => {
            const n = counts.get(c.slug) ?? 0
            return (
              <Link key={c.slug} href={`/items/${c.slug}`} className="item-group">
                <span className="item-group__text">
                  <b>{c.name}</b>
                  <span>{c.blurb}</span>
                  <span className="item-group__count">{n > 0 ? `${n} รายการ` : 'เร็ว ๆ นี้'}</span>
                </span>
                <Icon name="right" size={20} strokeWidth={2} />
              </Link>
            )
          })}
        </div>
      </main>
    </>
  )
}
