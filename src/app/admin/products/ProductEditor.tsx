'use client'

import { startTransition, useActionState, useState } from 'react'
import { productGroups } from '@/data/product-groups'
import { isAffiliateShortLink } from '@/lib/shopee'
import { uploadPhotos } from '@/lib/upload-client'
import { saveProductAction, type ProductFormState } from './actions'

export type ProductDraft = {
  id?: string
  name: string
  group: string
  reason: string
  imageUrl: string
  shopeeUrl: string
  sort: string
  checkedAt: string
  published: boolean
}

export function ProductEditor({ draft }: { draft: ProductDraft }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProductAction, {})
  const [values, setValues] = useState(draft)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const e = state.errors ?? {}
  const set = (k: keyof ProductDraft, v: string | boolean) => setValues((prev) => ({ ...prev, [k]: v }))

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setUploadError('')
    try {
      const [u] = await uploadPhotos([files[0]], 'place')
      if (!u?.publicUrl) throw new Error('ยังไม่ได้ตั้งค่าที่เก็บรูป')
      set('imageUrl', u.publicUrl)
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
        <legend>สินค้า</legend>
        <div className="form__grid--stack">
          <Field id="name" label="ชื่อสินค้า" error={e.name}>
            <input
              id="name"
              name="name"
              className="input"
              value={values.name}
              onChange={(ev) => set('name', ev.target.value)}
            />
          </Field>
          <Field id="group" label="หมวด" error={e.group}>
            <select
              id="group"
              name="group"
              className="input"
              value={values.group}
              onChange={(ev) => set('group', ev.target.value)}
            >
              <option value="">เลือกหมวด</option>
              {productGroups.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="reason"
            label="ทำไมเราเลือก"
            hint="1–2 ประโยค เป็นข้อเท็จจริง เช่น ใช้เองมากี่เดือน เหมาะกับหมาแบบไหน"
          >
            <textarea
              id="reason"
              name="reason"
              className="input"
              rows={3}
              value={values.reason}
              onChange={(ev) => set('reason', ev.target.value)}
            />
          </Field>
          <Field
            id="shopeeUrl"
            label="ลิงก์ Shopee"
            hint="สร้างจากหน้า Shopee Affiliate (ลิงก์ s.shopee.co.th/…) ถึงจะได้ค่าคอมมิชชัน"
            error={e.shopeeUrl}
          >
            <input
              id="shopeeUrl"
              name="shopeeUrl"
              className="input"
              inputMode="url"
              value={values.shopeeUrl}
              onChange={(ev) => set('shopeeUrl', ev.target.value)}
              placeholder="https://s.shopee.co.th/..."
            />
          </Field>
          {values.shopeeUrl && !isAffiliateShortLink(values.shopeeUrl) && !e.shopeeUrl && (
            <p className="admin-warning">
              ลิงก์นี้ไม่ใช่ลิงก์ Affiliate (s.shopee.co.th) คนกดซื้อได้ แต่เราจะไม่ได้ค่าคอมมิชชัน
            </p>
          )}
          <Field id="imageUrl" label="รูป" hint="ใช้รูปที่ถ่ายเอง หรือรูปที่มีสิทธิ์ใช้" error={e.imageUrl}>
            <input
              id="imageUrl"
              name="imageUrl"
              className="input"
              value={values.imageUrl}
              onChange={(ev) => set('imageUrl', ev.target.value)}
              placeholder="อัปโหลด หรือวางลิงก์รูป"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(ev) => upload(ev.target.files)}
              disabled={uploading}
            />
          </Field>
          {uploadError && <span className="field__error">{uploadError}</span>}
          {values.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- preview of the uploaded image
            <img src={values.imageUrl} alt="" className="admin-product-image" />
          )}
          <Field id="sort" label="ลำดับในหมวด" hint="เลขน้อยขึ้นก่อน" error={e.sort}>
            <input
              id="sort"
              name="sort"
              className="input"
              inputMode="numeric"
              value={values.sort}
              onChange={(ev) => set('sort', ev.target.value)}
            />
          </Field>
          <Field id="checkedAt" label="เช็คลิงก์ล่าสุด" error={e.checkedAt}>
            <input
              id="checkedAt"
              name="checkedAt"
              type="date"
              className="input"
              value={values.checkedAt}
              onChange={(ev) => set('checkedAt', ev.target.value)}
            />
          </Field>
          <label className="checkbox">
            <input
              type="checkbox"
              name="published"
              checked={values.published}
              onChange={(ev) => set('published', ev.target.checked)}
            />
            แสดงบนเว็บ
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
