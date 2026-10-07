import type { Metadata } from 'next'
import { EmptyState } from '@/components/EmptyState'
import { SiteHeader } from '@/components/SiteHeader'
import { productGroups } from '@/data/product-groups'
import { formatDay } from '@/lib/format'
import { listPublishedProducts } from '@/lib/products'

export const revalidate = 3600

const TITLE = 'หมาเราต้องมี'
const DESCRIPTION =
  'ของใช้น้องหมาที่ทีม SawasdeeDog คัด บอกเหตุผลทุกชิ้น ทั้งอุปกรณ์ฝึกแบบ Force-Free อาหารและขนม ของพาน้องไปเที่ยว และของใช้ในบ้าน'

export async function generateMetadata(): Promise<Metadata> {
  const products = await listPublishedProducts()
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/shopping' },
    // Kept out of search until there is something to show.
    robots: products.length === 0 ? { index: false, follow: true } : undefined,
  }
}

/** Dog products the team picked, by group, each linking to Shopee through our affiliate link. */
export default async function ShoppingPage() {
  const products = await listPublishedProducts()
  const groups = productGroups
    .map((g) => ({ ...g, items: products.filter((p) => p.group === g.slug) }))
    .filter((g) => g.items.length > 0)

  return (
    <>
      <SiteHeader back="/" />
      <main className="prose-page shopping">
        <div className="prose-page__intro">
          <span className="eyebrow">ของใช้ อาหาร และขนมน้องหมา</span>
          <h1>{TITLE}</h1>
          <p>ของที่ทีมคัดแบบเดียวกับที่เราคัดร้าน ทุกชิ้นบอกว่าทำไมเราเลือก</p>
          <p className="shopping__note">
            ลิงก์ในหน้านี้เป็นลิงก์พันธมิตรของ Shopee เราอาจได้ค่าตอบแทนเมื่อคุณซื้อ ไม่มีผลต่อราคา
            และไม่มีผลต่อการเลือก ราคาและสต็อกดูใน Shopee
          </p>
        </div>

        {groups.length === 0 ? (
          <EmptyState
            compact
            title="กำลังคัดของอยู่"
            body="ระหว่างนี้ อ่านได้ว่าเราคัดสถานที่ยังไง"
            primary={{ href: '/criteria', label: 'อ่านเกณฑ์การคัดเลือก' }}
            secondary={{ href: '/', label: 'กลับหน้าแรก' }}
          />
        ) : (
          groups.map((g) => (
            <section key={g.slug} id={g.slug} className="product-group">
              <h2>{g.name}</h2>
              <p className="product-group__blurb">{g.blurb}</p>
              <ul className="product-list">
                {g.items.map((p) => (
                  <li key={p.id} className="product-card">
                    {p.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- uploaded product photos
                      <img className="product-card__image" src={p.imageUrl} alt={p.name} loading="lazy" />
                    )}
                    <div className="product-card__body">
                      <h3 className="product-card__name">{p.name}</h3>
                      {p.reason && <p className="product-card__reason">{p.reason}</p>}
                      <span className="product-card__checked">เช็คลิงก์ล่าสุด {formatDay(p.checkedAt)}</span>
                      <a
                        href={p.shopeeUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="btn btn--booking product-card__buy"
                        data-track="shopee_click"
                        data-product={p.name}
                        data-group={g.slug}
                      >
                        ดูใน Shopee
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </main>
    </>
  )
}
