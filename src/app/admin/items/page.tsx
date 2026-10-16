import Link from 'next/link'
import { itemCategories } from '@/data/item-categories'
import { requireAdminPage } from '@/lib/admin-page'
import { listAllProducts, type Product } from '@/lib/products'
import { ImportItems } from './ImportItems'

type Props = { searchParams: Promise<{ imported?: string }> }

export default async function AdminItems({ searchParams }: Props) {
  await requireAdminPage()
  const { imported } = await searchParams
  let products: Product[] = []
  let missingTable = false
  try {
    products = await listAllProducts()
  } catch {
    missingTable = true
  }

  return (
    <>
      <div className="admin-titlebar">
        <h1>ไอเทม ({products.length})</h1>
        <Link href="/admin/items/new" className="btn btn--primary btn--sm">
          + เพิ่มไอเทม
        </Link>
      </div>
      {missingTable && (
        <p className="admin-warning">
          ยังไม่มีตาราง products ใน Supabase ให้รัน supabase/migrations/0013_products.sql ก่อน
        </p>
      )}
      {imported && <p className="admin-notice">นำเข้าแล้ว {imported} รายการ</p>}
      <ImportItems />
      {itemCategories.map((c) => {
        const list = products.filter((p) => p.category === c.slug)
        if (list.length === 0) return null
        return (
          <section key={c.slug}>
            <h2>
              {c.name} ({list.length})
            </h2>
            <ul className="admin-list">
              {list.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/items/${p.id}`} className="admin-row">
                    <span className="admin-row__main">
                      <b>{p.name}</b>
                      <span>
                        {[
                          p.published ? 'เผยแพร่แล้ว' : 'ฉบับร่าง',
                          p.brand,
                          c.subcategories.find((s) => s.slug === p.subcategory)?.name,
                          !p.reason && 'ยังไม่มีเหตุผลที่ครูเลือก',
                          !p.imageUrl && 'ยังไม่มีรูป',
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
