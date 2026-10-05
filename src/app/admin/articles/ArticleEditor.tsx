'use client'

import { startTransition, useActionState, useRef, useState } from 'react'
import { uploadPhotos } from '@/lib/upload-client'
import { saveArticleAction, type ArticleFormState } from './actions'

export type ArticleDraft = {
  id?: string
  slug: string
  title: string
  excerpt: string
  coverUrl: string
  body: string
  author: string
  published: boolean
}

const FIELDS = ['slug', 'title', 'excerpt', 'coverUrl', 'body', 'author'] as const

export function ArticleEditor({ draft }: { draft: ArticleDraft }) {
  const [state, action, pending] = useActionState<ArticleFormState, FormData>(saveArticleAction, {})
  const [values, setValues] = useState(draft)
  const [json, setJson] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const e = state.errors ?? {}
  const set = (k: keyof ArticleDraft, v: string | boolean) => setValues((prev) => ({ ...prev, [k]: v }))

  // Fills the form from pasted JSON: { title, slug, excerpt, coverUrl, author, body, published }.
  function applyJson() {
    try {
      const raw = JSON.parse(json) as Record<string, unknown>
      const obj = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown>
      const next = { ...values }
      for (const k of FIELDS) {
        const v = obj[k]
        if (typeof v === 'string') next[k] = v
        // A body may come as an array of paragraphs.
        if (k === 'body' && Array.isArray(v)) next.body = v.filter((x) => typeof x === 'string').join('\n\n')
      }
      if (typeof obj.published === 'boolean') next.published = obj.published
      setValues(next)
      setJsonError('')
      setJson('')
    } catch {
      setJsonError('อ่าน JSON ไม่ได้ ตรวจวงเล็บและเครื่องหมายคำพูด')
    }
  }

  async function upload(files: FileList | null, into: 'cover' | 'body') {
    if (!files?.length) return
    setUploading(true)
    setUploadError('')
    try {
      const [u] = await uploadPhotos([files[0]], 'place')
      if (!u?.publicUrl) throw new Error('ยังไม่ได้ตั้งค่าที่เก็บรูป')
      if (into === 'cover') set('coverUrl', u.publicUrl)
      else {
        // Insert the image as its own block at the cursor.
        const ta = bodyRef.current
        const at = ta?.selectionStart ?? values.body.length
        const before = values.body.slice(0, at).replace(/\s*$/, '')
        const after = values.body.slice(at).replace(/^\s*/, '')
        set('body', `${before}${before ? '\n\n' : ''}![](${u.publicUrl})${after ? '\n\n' : ''}${after}`)
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form
      className="form admin-form"
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault()
        if (pending || uploading) return
        const data = new FormData(ev.currentTarget)
        startTransition(() => action(data))
      }}
    >
      {draft.id && <input type="hidden" name="id" value={draft.id} />}
      {state.message && (
        <p className={Object.keys(e).length ? 'auth__error' : 'admin-notice'} role="status">
          {state.message}
        </p>
      )}
      {Object.keys(e).length > 0 && (
        <p className="auth__error" role="alert">
          ยังบันทึกไม่ได้ ตรวจช่องที่มีข้อความสีแดง
        </p>
      )}

      <fieldset className="admin-fieldset">
        <legend>วาง JSON (ไม่บังคับ)</legend>
        <textarea
          className="input"
          rows={4}
          value={json}
          onChange={(ev) => setJson(ev.target.value)}
          placeholder='{"title": "...", "slug": "...", "excerpt": "...", "body": "..."}'
          aria-label="JSON บทความ"
        />
        {jsonError && <span className="field__error">{jsonError}</span>}
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={applyJson}
          disabled={!json.trim()}
        >
          เติมข้อมูลจาก JSON
        </button>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>บทความ</legend>
        <div className="form__grid--stack">
          <Field id="title" label="ชื่อเรื่อง" error={e.title}>
            <input
              id="title"
              name="title"
              className="input"
              value={values.title}
              onChange={(ev) => set('title', ev.target.value)}
            />
          </Field>
          <Field
            id="slug"
            label="slug (ลิงก์)"
            hint="เช่น why-sawasdeedog → /stories/why-sawasdeedog"
            error={e.slug}
          >
            <input
              id="slug"
              name="slug"
              className="input"
              value={values.slug}
              onChange={(ev) => set('slug', ev.target.value)}
            />
          </Field>
          <Field id="excerpt" label="คำโปรย" hint="1–2 ประโยค ขึ้นในหน้ารวมบทความและตอนแชร์">
            <textarea
              id="excerpt"
              name="excerpt"
              className="input"
              rows={2}
              value={values.excerpt}
              onChange={(ev) => set('excerpt', ev.target.value)}
            />
          </Field>
          <Field id="author" label="ผู้เขียน" hint="เว้นว่าง = ทีม SawasdeeDog">
            <input
              id="author"
              name="author"
              className="input"
              value={values.author}
              onChange={(ev) => set('author', ev.target.value)}
            />
          </Field>
          <Field id="coverUrl" label="รูปปก" error={e.coverUrl}>
            <input
              id="coverUrl"
              name="coverUrl"
              className="input"
              value={values.coverUrl}
              onChange={(ev) => set('coverUrl', ev.target.value)}
              placeholder="อัปโหลด หรือวางลิงก์รูป"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(ev) => upload(ev.target.files, 'cover')}
              disabled={uploading}
            />
          </Field>
          {values.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- preview of the uploaded cover
            <img src={values.coverUrl} alt="" className="admin-article-cover" />
          )}
          <Field
            id="body"
            label="เนื้อหา"
            hint="เว้นบรรทัดว่างระหว่างย่อหน้า · ## หัวข้อ · ### หัวข้อย่อย · - รายการ · **ตัวหนา** · [ข้อความ](ลิงก์) · [[place:slug]] = การ์ดร้านในเว็บ"
            error={e.body}
          >
            <textarea
              id="body"
              name="body"
              ref={bodyRef}
              className="input admin-article-body"
              rows={20}
              value={values.body}
              onChange={(ev) => set('body', ev.target.value)}
            />
          </Field>
          <label className="btn btn--secondary btn--sm admin-upload-btn">
            {uploading ? 'กำลังอัปโหลด…' : '+ แทรกรูปในเนื้อหา (ตรงตำแหน่งเคอร์เซอร์)'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(ev) => upload(ev.target.files, 'body')}
              disabled={uploading}
            />
          </label>
          {uploadError && <span className="field__error">{uploadError}</span>}
          <label className="checkbox">
            <input
              type="checkbox"
              name="published"
              checked={values.published}
              onChange={(ev) => set('published', ev.target.checked)}
            />
            เผยแพร่บนเว็บ (ไม่ติ๊ก = เก็บเป็นฉบับร่าง)
          </label>
        </div>
      </fieldset>

      <button type="submit" className="btn btn--primary" disabled={pending || uploading}>
        {pending ? 'กำลังบันทึก…' : 'บันทึก'}
      </button>
    </form>
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <span className="field__error" role="alert">
          {error}
        </span>
      ) : (
        hint && <span className="field__hint">{hint}</span>
      )}
    </div>
  )
}
