'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { articleSlugTaken, deleteArticle, upsertArticle } from '@/lib/articles'
import { isSupabaseConfigured } from '@/lib/supabase'

export type ArticleFormState = { errors?: Record<string, string>; message?: string }

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

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

export async function saveArticleAction(_prev: ArticleFormState, form: FormData): Promise<ArticleFormState> {
  const admin = await requireAdmin()
  if (!isSupabaseConfigured()) return { message: 'ยังไม่ได้ตั้งค่า Supabase (ดู README)' }

  const id = text(form, 'id') || undefined
  const errors: Record<string, string> = {}
  const title = text(form, 'title')
  if (!title) errors.title = 'กรอกชื่อเรื่อง'
  const slug = text(form, 'slug').toLowerCase()
  if (!SLUG_RE.test(slug)) errors.slug = 'ใช้ a-z 0-9 และขีด - เช่น why-sawasdeedog'
  const coverUrl = text(form, 'coverUrl')
  if (coverUrl && !isHttpUrl(coverUrl)) errors.coverUrl = 'ลิงก์รูปต้องขึ้นต้นด้วย https://'
  const body = text(form, 'body')
  if (!body) errors.body = 'ยังไม่มีเนื้อหา'
  const published = form.get('published') === 'on'

  if (Object.keys(errors).length) return { errors }
  let saved: string
  try {
    if (await articleSlugTaken(slug, id)) return { errors: { slug: 'slug นี้มีบทความอื่นใช้แล้ว' } }
    saved = await upsertArticle(
      {
        slug,
        title,
        excerpt: text(form, 'excerpt') || null,
        cover_url: coverUrl || null,
        body,
        author: text(form, 'author') || null,
        published,
        updated_by: admin.name,
      },
      id,
    )
  } catch (e) {
    console.error(e)
    return { message: 'บันทึกไม่สำเร็จ (สร้างตาราง articles ใน Supabase แล้วหรือยัง?)' }
  }
  revalidatePath('/stories', 'layout')
  revalidatePath('/sitemap.xml')
  if (!id) redirect(`/admin/articles/${saved}?saved=1`)
  return { message: published ? 'บันทึกและเผยแพร่แล้ว' : 'บันทึกฉบับร่างแล้ว' }
}

export async function deleteArticleAction(form: FormData) {
  await requireAdmin()
  const id = text(form, 'id')
  if (id) await deleteArticle(id)
  revalidatePath('/stories', 'layout')
  redirect('/admin/articles')
}
