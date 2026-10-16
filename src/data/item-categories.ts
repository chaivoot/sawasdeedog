// Groups for the dog items directory (/items). Slugs are stored in products.category
// and products.subcategory, so rename labels freely but keep slugs.

export type ItemSubcategory = { slug: string; name: string }
export type ItemCategory = {
  slug: string
  name: string
  blurb: string
  subcategories: ItemSubcategory[]
}

export const itemCategories: ItemCategory[] = [
  {
    slug: 'food',
    name: 'ของกิน',
    blurb: 'อาหาร ขนม และอาหารเสริม',
    subcategories: [
      { slug: 'kibble', name: 'อาหารเม็ด' },
      { slug: 'wet', name: 'อาหารเปียก' },
      { slug: 'barf', name: 'บาร์ฟ' },
      { slug: 'cooked', name: 'อาหารปรุงสุก' },
      { slug: 'chews', name: 'ขนมแทะ' },
      { slug: 'treats', name: 'ขนมฝึก' },
      { slug: 'health', name: 'สุขภาพ' },
    ],
  },
  {
    slug: 'gear',
    name: 'ของใช้',
    blurb: 'กรง คอก พื้นกันลื่น สายจูง และฮาเนส',
    subcategories: [
      { slug: 'crate', name: 'กรง' },
      { slug: 'pen', name: 'คอก' },
      { slug: 'floor', name: 'พื้น' },
      { slug: 'leash', name: 'สายจูง' },
      { slug: 'harness', name: 'ฮาเนส' },
    ],
  },
  { slug: 'toys', name: 'ของเล่น', blurb: 'ของเล่นที่ใช้เล่นและฝึกไปด้วย', subcategories: [] },
  {
    slug: 'training',
    name: 'อุปกรณ์ฝึก',
    blurb: 'อุปกรณ์ฝึก ฟิตเนส และการทรงตัว',
    subcategories: [{ slug: 'fitness', name: 'ฟิตเนส' }],
  },
]

export function findItemCategory(slug: string): ItemCategory | undefined {
  return itemCategories.find((c) => c.slug === slug)
}

export function findItemSubcategory(category: string, slug: string): ItemSubcategory | undefined {
  return findItemCategory(category)?.subcategories.find((s) => s.slug === slug)
}
