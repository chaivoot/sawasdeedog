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
    name: 'อาหารหมา',
    blurb: 'อาหารเม็ด อาหารเปียก บาร์ฟ และอาหารปรุงสุก',
    subcategories: [
      { slug: 'kibble', name: 'อาหารเม็ด' },
      { slug: 'wet', name: 'อาหารเปียก' },
      { slug: 'barf', name: 'บาร์ฟ' },
      { slug: 'cooked', name: 'อาหารปรุงสุก' },
    ],
  },
  { slug: 'toys', name: 'ของเล่น', blurb: 'ของเล่นที่ใช้เล่นและฝึกไปด้วย', subcategories: [] },
  { slug: 'chews', name: 'ขนมแทะ', blurb: 'ของแทะนาน ๆ ช่วยให้น้องผ่อนคลาย', subcategories: [] },
  { slug: 'treats', name: 'ขนมฝึก', blurb: 'ขนมชิ้นเล็กสำหรับให้รางวัลตอนฝึก', subcategories: [] },
  { slug: 'health', name: 'สุขภาพ', blurb: 'โพรไบโอติกและอาหารเสริม', subcategories: [] },
  {
    slug: 'gear',
    name: 'ของใช้',
    blurb: 'กรง คอก และพื้นกันลื่น',
    subcategories: [
      { slug: 'crate', name: 'กรง' },
      { slug: 'pen', name: 'คอก' },
      { slug: 'floor', name: 'พื้น' },
    ],
  },
  {
    slug: 'walk',
    name: 'สายจูง / ฮาเนส',
    blurb: 'อุปกรณ์พาเดินที่ใส่สบายและปลอดภัย',
    subcategories: [
      { slug: 'leash', name: 'สายจูง' },
      { slug: 'harness', name: 'ฮาเนส' },
    ],
  },
  { slug: 'fitness', name: 'อุปกรณ์ฟิตเนส', blurb: 'อุปกรณ์ออกกำลังและฝึกการทรงตัว', subcategories: [] },
]

export function findItemCategory(slug: string): ItemCategory | undefined {
  return itemCategories.find((c) => c.slug === slug)
}

export function findItemSubcategory(category: string, slug: string): ItemSubcategory | undefined {
  return findItemCategory(category)?.subcategories.find((s) => s.slug === slug)
}
