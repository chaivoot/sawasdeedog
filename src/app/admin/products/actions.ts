'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getProductGroup } from '@/data/product-groups'
import { requireAdmin } from '@/lib/admin'
import { removePlacePhotos } from '@/lib/place-photos'
import { deleteProduct, getProductById, upsertProduct } from '@/lib/products'
import { isShopeeUrl } from '@/lib/shopee'
import { isSupabaseConfigured } from '@/lib/supabase'

export type ProductFormState = { errors?: Record<string, string>; message?: string }

function text(form: FormData, key: string) {
  const v = form.get(key)
  return typeof v === 'string' ? v.trim() : ''
}

function isHttpUrl(v: string) {
  try {
    return ['https:', 'http:'].includes(new URL(v).protocol)
  } catch {
    return false
  }
}

export async function saveProductAction(_prev: ProductFormState, form: FormData): Promise<ProductFormState> {
  const admin = await requireAdmin()
  if (!isSupabaseConfigured()) return { message: 'ยังไม่ได้ตั้งค่า Supabase (ดู README)' }

  const id = text(form, 'id') || undefined
  const errors: Record<string, string> = {}
  const name = text(form, 'name')
  if (!name) errors.name = 'กรอกชื่อสินค้า'
  const group = text(form, 'group')
  if (!getProductGroup(group)) errors.group = 'เลือกหมวด'
  const shopeeUrl = text(form, 'shopeeUrl')
  if (!isShopeeUrl(shopeeUrl)) errors.shopeeUrl = 'ใส่ลิงก์ Shopee (จากหน้า Affiliate)'
  const imageUrl = text(form, 'imageUrl')
  if (imageUrl && !isHttpUrl(imageUrl)) errors.imageUrl = 'ลิงก์รูปต้องขึ้นต้นด้วย https://'
  const sortText = text(form, 'sort')
  const sort = sortText ? Number(sortText) : 0
  if (!Number.isInteger(sort)) errors.sort = 'ใส่เป็นตัวเลข เช่น 1'
  const checkedAt = text(form, 'checkedAt')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)) errors.checkedAt = 'ใส่วันที่เช็ค'

  if (Object.keys(errors).length) return { errors }
  const before = id ? await getProductById(id) : undefined
  let saved: string
  try {
    saved = await upsertProduct(
      {
        name,
        group_slug: group,
        reason: text(form, 'reason') || null,
        image_url: imageUrl || null,
        shopee_url: shopeeUrl,
        sort,
        checked_at: checkedAt,
        published: form.get('published') === 'on',
        updated_by: admin.name,
      },
      id,
    )
  } catch (e) {
    console.error(e)
    return { message: 'บันทึกไม่สำเร็จ (สร้างตาราง products ใน Supabase แล้วหรือยัง?)' }
  }
  // A replaced image: delete its file once the save has gone through.
  if (before?.imageUrl && before.imageUrl !== imageUrl) await removePlacePhotos([before.imageUrl])
  revalidatePath('/', 'layout')
  if (!id) redirect(`/admin/products/${saved}?saved=1`)
  return { message: 'บันทึกแล้ว' }
}

export async function deleteProductAction(form: FormData) {
  await requireAdmin()
  const id = text(form, 'id')
  if (id) {
    const image = (await getProductById(id))?.imageUrl
    await deleteProduct(id)
    if (image) await removePlacePhotos([image])
  }
  revalidatePath('/', 'layout')
  redirect('/admin/products')
}
