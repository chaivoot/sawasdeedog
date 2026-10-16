import type { Product } from '@/lib/products'
import { findItemSubcategory } from '@/data/item-categories'
import { shopName } from '@/lib/shop-links'
import { Icon } from './Icon'

/** One recommended item: photo, why the trainer picked it, and where to buy. */
export function ProductCard({ product: p }: { product: Product }) {
  const sub = p.subcategory ? findItemSubcategory(p.category, p.subcategory) : undefined
  return (
    <article className="product-card" id={`item-${p.id}`}>
      {p.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- uploaded item photo
        <img className="product-card__photo" src={p.imageUrl} alt={p.name} loading="lazy" />
      ) : (
        <span className="product-card__photo product-card__photo--empty">
          <Icon name="bag" size={32} />
        </span>
      )}
      <div className="product-card__body">
        <span className="product-card__eyebrow">{[p.brand, sub?.name].filter(Boolean).join(' · ')}</span>
        <h3 className="product-card__name">{p.name}</h3>
        {p.reason && (
          <p className="product-card__reason">
            <b>{p.recommendedBy ? `${p.recommendedBy} เลือกเพราะ` : 'ทำไมเราเลือก'}</b> {p.reason}
          </p>
        )}
        <div className="product-card__foot">
          {p.priceNote && <span className="product-card__price">{p.priceNote}</span>}
          {p.buyUrl && (
            <a
              className="btn btn--primary btn--sm"
              href={p.buyUrl}
              target="_blank"
              rel="sponsored nofollow noopener"
            >
              ดูที่ {shopName(p.buyUrl)} ↗
            </a>
          )}
        </div>
      </div>
    </article>
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
