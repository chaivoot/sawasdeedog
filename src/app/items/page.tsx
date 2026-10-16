import type { Metadata } from 'next'
import { EmptyState } from '@/components/EmptyState'
import { ProductFilter } from '@/components/ProductFilter'
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

/** Every recommended item, narrowed with group and type chips. */
export default async function ItemsPage() {
  const products = await listPublishedProducts()
  // Group order follows the group list, so the "ทั้งหมด" view reads like the chips.
  const order = new Map(itemCategories.map((c, i) => [c.slug, i]))
  const sorted = [...products].sort((a, b) => (order.get(a.category) ?? 99) - (order.get(b.category) ?? 99))

  return (
    <>
      <SiteHeader back="/" />
      <main className="prose-page">
        <div className="prose-page__intro">
          <span className="eyebrow">ไอเทม</span>
          <h1>ไอเทมน้องหมา ครูฝึกแนะนำ</h1>
          <p>{DESCRIPTION}</p>
        </div>
        {sorted.length > 0 ? (
          <ProductFilter products={sorted} groups={itemCategories} />
        ) : (
          <EmptyState
            compact
            title="ครูกำลังคัดอยู่"
            body="ระหว่างนี้ อ่านเรื่องหมาๆ ก่อนได้"
            primary={{ href: '/stories', label: 'อ่านเรื่องหมาๆ' }}
            secondary={{ href: '/', label: 'กลับหน้าแรก' }}
          />
        )}
      </main>
    </>
  )
}
