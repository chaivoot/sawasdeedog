'use client'

import { useState } from 'react'
import type { ItemSubcategory } from '@/data/item-categories'
import type { Product } from '@/lib/products'
import { ProductCard } from './ProductCard'

/** All items in a group, with chips to narrow to one type (kibble, wet…). */
export function ProductFilter({ products, types }: { products: Product[]; types: ItemSubcategory[] }) {
  const [type, setType] = useState<string>()
  // Only types that have items get a chip.
  const chips = types.filter((t) => products.some((p) => p.subcategory === t.slug))
  const shown = type ? products.filter((p) => p.subcategory === type) : products

  return (
    <>
      {chips.length > 1 && (
        <div className="chip-row" role="group" aria-label="ประเภท">
          <button type="button" className="chip" aria-pressed={!type} onClick={() => setType(undefined)}>
            ทั้งหมด ({products.length})
          </button>
          {chips.map((t) => (
            <button
              key={t.slug}
              type="button"
              className="chip"
              aria-pressed={type === t.slug}
              onClick={() => setType(t.slug)}
            >
              {t.name} ({products.filter((p) => p.subcategory === t.slug).length})
            </button>
          ))}
        </div>
      )}
      <div className="product-list">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  )
}
