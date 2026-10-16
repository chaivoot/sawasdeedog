import { findItemCategory, findItemSubcategory } from '@/data/item-categories'
import type { ProductInput } from '@/lib/products'
import { isHttpsUrl } from '@/lib/shop-links'

/** Item fields as typed in the editor or pasted as JSON. */
export type ItemFields = {
  slug: string
  name: string
  brand: string
  category: string
  subcategory: string
  imageUrl: string
  priceNote: string
  reason: string
  recommendedBy: string
  buyUrl: string
  sort: string
  published: boolean
}

export const ITEM_TEXT_FIELDS = [
  'slug',
  'name',
  'brand',
  'category',
  'subcategory',
  'imageUrl',
  'priceNote',
  'reason',
  'recommendedBy',
  'buyUrl',
  'sort',
] as const

/** Reads one pasted JSON object into editor fields; numbers (sort) become text. */
export function fieldsFromJson(obj: Record<string, unknown>): Partial<ItemFields> {
  const out: Partial<ItemFields> = {}
  for (const k of ITEM_TEXT_FIELDS) {
    const v = obj[k]
    if (typeof v === 'string') out[k] = v.trim()
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = String(v)
  }
  if (typeof obj.published === 'boolean') out.published = obj.published
  return out
}

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** A page address from the Latin words in the brand and name ("Hosttail" + "… Safe Step 6 มม." → hosttail-safe-step-6). */
export function suggestSlug(brand: string, name: string): string {
  return `${brand} ${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
}

/** Makes a slug unique among `taken` by adding -2, -3…; falls back to "item" when there is none. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || 'item'
  let slug = root
  for (let n = 2; taken.has(slug); n++) slug = `${root}-${n}`
  taken.add(slug)
  return slug
}

/** Checks the fields; returns errors by field, or the row to save. */
export function validateItem(
  f: Partial<ItemFields>,
  updatedBy: string,
): { errors: Record<string, string> } | { row: ProductInput } {
  const errors: Record<string, string> = {}
  const t = (k: (typeof ITEM_TEXT_FIELDS)[number]) => (f[k] ?? '').trim()
  const name = t('name')
  if (!name) errors.name = 'กรอกชื่อสินค้า'
  const category = t('category')
  if (!findItemCategory(category)) errors.category = 'เลือกหมวด'
  const subcategory = t('subcategory')
  if (subcategory && !findItemSubcategory(category, subcategory))
    errors.subcategory = 'ประเภทนี้ไม่มีในหมวดที่เลือก'
  const imageUrl = t('imageUrl')
  if (imageUrl && !isHttpsUrl(imageUrl)) errors.imageUrl = 'ลิงก์รูปต้องขึ้นต้นด้วย https://'
  const buyUrl = t('buyUrl')
  if (buyUrl && !isHttpsUrl(buyUrl)) errors.buyUrl = 'ลิงก์ซื้อต้องขึ้นต้นด้วย https://'
  const slug = t('slug').toLowerCase()
  if (slug && !SLUG_RE.test(slug)) errors.slug = 'ใช้ a-z 0-9 และขีด - เช่น hosttail-safe-step'
  const sortText = t('sort')
  const sort = sortText ? Number(sortText) : 0
  if (!Number.isInteger(sort)) errors.sort = 'ใส่เป็นจำนวนเต็ม'
  if (Object.keys(errors).length) return { errors }
  return {
    row: {
      // Empty means "make one from the brand and name" when saving.
      slug,
      name,
      brand: t('brand') || null,
      category,
      subcategory: subcategory || null,
      image_url: imageUrl || null,
      price_note: t('priceNote') || null,
      reason: t('reason') || null,
      recommended_by: t('recommendedBy') || null,
      buy_url: buyUrl || null,
      sort,
      published: f.published ?? false,
      updated_by: updatedBy,
    },
  }
}
