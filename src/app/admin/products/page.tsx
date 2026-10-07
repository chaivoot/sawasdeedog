import Link from 'next/link'
import { getProductGroup } from '@/data/product-groups'
import { requireAdminPage } from '@/lib/admin-page'
import { formatDay } from '@/lib/format'
import { listAllProducts, type Product } from '@/lib/products'
import { isAffiliateShortLink } from '@/lib/shopee'

export default async function AdminProducts() {
  await requireAdminPage()
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
        <h1>สินค้า (หมาเราต้องมี)</h1>
        <Link href="/admin/products/new" className="btn btn--primary btn--sm">
          + เพิ่มสินค้า
        </Link>
      </div>
      {missingTable && (
        <p className="admin-warning">
          ยังไม่มีตาราง products ใน Supabase ให้รัน supabase/migrations/0013_products.sql ก่อน
        </p>
      )}
      {products.length === 0 && !missingTable ? (
        <p>ยังไม่มีสินค้า</p>
      ) : (
        <ul className="admin-list">
          {products.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/products/${p.id}`} className="admin-row">
                <span className="admin-row__main">
                  <b>{p.name}</b>
                  <span>
                    {getProductGroup(p.group)?.name ?? p.group} · {p.published ? 'แสดงบนเว็บ' : 'ซ่อนอยู่'} ·
                    เช็คล่าสุด {formatDay(p.checkedAt)}
                    {!isAffiliateShortLink(p.shopeeUrl) && ' · ไม่ใช่ลิงก์ Affiliate'}
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
