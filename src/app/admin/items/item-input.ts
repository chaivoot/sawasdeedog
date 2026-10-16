import { findItemCategory, findItemSubcategory } from '@/data/item-categories'
import type { ProductInput } from '@/lib/products'
import { isHttpsUrl } from '@/lib/shop-links'

/** Item fields as typed in the editor or pasted as JSON. */
export type ItemFields = {
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
  const sortText = t('sort')
  const sort = sortText ? Number(sortText) : 0
  if (!Number.isInteger(sort)) errors.sort = 'ใส่เป็นจำนวนเต็ม'
  if (Object.keys(errors).length) return { errors }
  return {
    row: {
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
