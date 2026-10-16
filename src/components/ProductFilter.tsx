'use client'

import { useState } from 'react'
import type { ItemCategory, ItemSubcategory } from '@/data/item-categories'
import type { Product } from '@/lib/products'
import { ProductCard } from './ProductCard'

type Props = {
  products: Product[]
  /** On /items: chips for each group, then for the chosen group's types. */
  groups?: ItemCategory[]
  /** On a group page: chips for its types. */
  types?: ItemSubcategory[]
}

/** Every item up front, with chips to narrow by group and type. */
export function ProductFilter({ products, groups, types }: Props) {
  const [group, setGroup] = useState<string>()
  const [type, setType] = useState<string>()
  const inGroup = group ? products.filter((p) => p.category === group) : products
  const typeList = groups ? (groups.find((g) => g.slug === group)?.subcategories ?? []) : (types ?? [])
  const shown = type ? inGroup.filter((p) => p.subcategory === type) : inGroup
  // Only groups and types that have items get a chip.
  const groupChips = (groups ?? []).filter((g) => products.some((p) => p.category === g.slug))
  const typeChips = typeList.filter((t) => inGroup.some((p) => p.subcategory === t.slug))

  return (
    <>
      {groupChips.length > 1 && (
        <ChipRow
          label="หมวด"
          all={products.length}
          chips={groupChips.map((g) => ({
            slug: g.slug,
            name: g.name,
            count: products.filter((p) => p.category === g.slug).length,
          }))}
          value={group}
          onChange={(v) => {
            setGroup(v)
            setType(undefined)
          }}
        />
      )}
      {typeChips.length > 1 && (
        <ChipRow
          label="ประเภท"
          all={inGroup.length}
          chips={typeChips.map((t) => ({
            slug: t.slug,
            name: t.name,
            count: inGroup.filter((p) => p.subcategory === t.slug).length,
          }))}
          value={type}
          onChange={setType}
        />
      )}
      <div className="product-list">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  )
}

function ChipRow({
  label,
  all,
  chips,
  value,
  onChange,
}: {
  label: string
  all: number
  chips: { slug: string; name: string; count: number }[]
  value?: string
  onChange: (v?: string) => void
}) {
  return (
    <div className="chip-row" role="group" aria-label={label}>
      <button type="button" className="chip" aria-pressed={!value} onClick={() => onChange(undefined)}>
        ทั้งหมด ({all})
      </button>
      {chips.map((c) => (
        <button
          key={c.slug}
          type="button"
          className="chip"
          aria-pressed={value === c.slug}
          onClick={() => onChange(c.slug)}
        >
          {c.name} ({c.count})
        </button>
      ))}
    </div>
  )
}
