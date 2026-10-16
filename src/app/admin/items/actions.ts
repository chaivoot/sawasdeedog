'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { deleteProduct, insertProducts, upsertProduct, type ProductInput } from '@/lib/products'
import { isSupabaseConfigured } from '@/lib/supabase'
import { ITEM_TEXT_FIELDS, fieldsFromJson, validateItem, type ItemFields } from './item-input'

export type ItemFormState = { errors?: Record<string, string>; message?: string }
export type ImportState = { errors?: string[]; message?: string }

const MISSING_TABLE = 'บันทึกไม่สำเร็จ (สร้างตาราง products ใน Supabase แล้วหรือยัง?)'

function revalidateItems() {
  revalidatePath('/items', 'layout')
  revalidatePath('/sitemap.xml')
}

export async function saveItemAction(_prev: ItemFormState, form: FormData): Promise<ItemFormState> {
  const admin = await requireAdmin()
  if (!isSupabaseConfigured()) return { message: 'ยังไม่ได้ตั้งค่า Supabase (ดู README)' }
  const id = (form.get('id') as string | null) || undefined
  const fields: Partial<ItemFields> = { published: form.get('published') === 'on' }
  for (const k of ITEM_TEXT_FIELDS) {
    const v = form.get(k)
    if (typeof v === 'string') fields[k] = v
  }
  const checked = validateItem(fields, admin.name)
  if ('errors' in checked) return { errors: checked.errors }
  let saved: string
  try {
    saved = await upsertProduct(checked.row, id)
  } catch (e) {
    console.error(e)
    return { message: MISSING_TABLE }
  }
  revalidateItems()
  if (!id) redirect(`/admin/items/${saved}?saved=1`)
  return { message: checked.row.published ? 'บันทึกและเผยแพร่แล้ว' : 'บันทึกฉบับร่างแล้ว' }
}

/** Adds many items from a pasted JSON array; nothing is saved unless every item passes. */
export async function importItemsAction(_prev: ImportState, form: FormData): Promise<ImportState> {
  const admin = await requireAdmin()
  if (!isSupabaseConfigured()) return { message: 'ยังไม่ได้ตั้งค่า Supabase (ดู README)' }
  let raw: unknown
  try {
    raw = JSON.parse(String(form.get('json') ?? ''))
  } catch {
    return { errors: ['อ่าน JSON ไม่ได้ ตรวจวงเล็บและเครื่องหมายคำพูด'] }
  }
  const list = Array.isArray(raw) ? raw : [raw]
  const rows: ProductInput[] = []
  const errors: string[] = []
  list.forEach((obj, i) => {
    if (!obj || typeof obj !== 'object') return errors.push(`รายการที่ ${i + 1}: ไม่ใช่ object`)
    const checked = validateItem(fieldsFromJson(obj as Record<string, unknown>), admin.name)
    if ('errors' in checked) {
      const name = (obj as { name?: unknown }).name
      errors.push(
        `รายการที่ ${i + 1}${typeof name === 'string' ? ` (${name})` : ''}: ${Object.values(checked.errors).join(', ')}`,
      )
    } else rows.push(checked.row)
  })
  if (errors.length) return { errors }
  if (rows.length === 0) return { errors: ['ไม่มีรายการ'] }
  try {
    await insertProducts(rows)
  } catch (e) {
    console.error(e)
    return { message: MISSING_TABLE }
  }
  revalidateItems()
  redirect(`/admin/items?imported=${rows.length}`)
}

export async function deleteItemAction(form: FormData) {
  await requireAdmin()
  const id = form.get('id')
  if (typeof id === 'string' && id) await deleteProduct(id)
  revalidateItems()
  redirect('/admin/items')
}
