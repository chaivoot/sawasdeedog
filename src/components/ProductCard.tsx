import Link from 'next/link'
import { productPath, type Product } from '@/lib/products'
import { Icon } from './Icon'

/** Item tile in a group list: photo and name; the review is on the item's own page. */
export function ProductCard({ product: p }: { product: Product }) {
  return (
    <Link href={productPath(p)} className="product-tile">
      <ProductPhoto product={p} className="product-tile__photo" />
      <span className="product-tile__text">
        {p.brand && <span className="product-tile__brand">{p.brand}</span>}
        <span className="product-tile__name">{p.name}</span>
      </span>
    </Link>
  )
}

export function ProductPhoto({ product: p, className }: { product: Product; className: string }) {
  return p.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- uploaded item photo
    <img className={className} src={p.imageUrl} alt={p.name} loading="lazy" />
  ) : (
    <span className={`${className} product-photo--empty`}>
      <Icon name="bag" size={32} />
    </span>
  )
}

export function AffiliateNote() {
  return (
    <p className="affiliate-note">
      ลิงก์ซื้อบางลิงก์เป็นลิงก์ affiliate ถ้าซื้อผ่านลิงก์ เว็บจะได้ค่าคอมมิชชันเล็กน้อย
      ราคาที่คุณจ่ายเท่าเดิม
    </p>
  )
}
