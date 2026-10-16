'use client'

import { startTransition, useActionState, useState } from 'react'
import { itemCategories } from '@/data/item-categories'
import { uploadPhotos } from '@/lib/upload-client'
import { saveItemAction, type ItemFormState } from './actions'
import { fieldsFromJson, type ItemFields } from './item-input'

export function ItemEditor({ id, draft }: { id?: string; draft: ItemFields }) {
  const [state, action, pending] = useActionState<ItemFormState, FormData>(saveItemAction, {})
  const [values, setValues] = useState(draft)
  const [json, setJson] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const e = state.errors ?? {}
  const set = (k: keyof ItemFields, v: string | boolean) => setValues((prev) => ({ ...prev, [k]: v }))
  const category = itemCategories.find((c) => c.slug === values.category)

  function applyJson() {
    try {
      const raw = JSON.parse(json) as unknown
      const obj = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown>
      setValues((prev) => ({ ...prev, ...fieldsFromJson(obj) }))
      setJsonError('')
      setJson('')
    } catch {
      setJsonError('อ่าน JSON ไม่ได้ ตรวจวงเล็บและเครื่องหมายคำพูด')
    }
  }

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

  const text = (k: keyof ItemFields, label: string, hint?: string, rows?: number) => (
    <Field id={k} label={label} hint={hint} error={e[k]}>
      {rows ? (
        <textarea
          id={k}
          name={k}
          className="input"
          rows={rows}
          value={values[k] as string}
          onChange={(ev) => set(k, ev.target.value)}
        />
      ) : (
        <input
          id={k}
          name={k}
          className="input"
          value={values[k] as string}
          onChange={(ev) => set(k, ev.target.value)}
        />
      )}
    </Field>
  )

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
      {id && <input type="hidden" name="id" value={id} />}
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
          rows={3}
          value={json}
          onChange={(ev) => setJson(ev.target.value)}
          placeholder='{"name": "...", "category": "gear", "subcategory": "harness", "reason": "..."}'
          aria-label="JSON ไอเทม"
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
        <legend>ไอเทม</legend>
        <div className="form__grid--stack">
          {text('name', 'ชื่อสินค้า (ระบุรุ่น)')}
          {text('brand', 'แบรนด์')}
          {text(
            'slug',
            'slug (ลิงก์หน้าไอเทม)',
            'a-z 0-9 และขีด - · เว้นว่าง = สร้างจากแบรนด์และชื่อให้อัตโนมัติ',
          )}
          <Field id="category" label="หมวด" error={e.category}>
            <select
              id="category"
              name="category"
              className="input"
              value={values.category}
              onChange={(ev) =>
                setValues((prev) => ({ ...prev, category: ev.target.value, subcategory: '' }))
              }
            >
              <option value="">เลือกหมวด</option>
              {itemCategories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          {category && category.subcategories.length > 0 && (
            <Field id="subcategory" label="ประเภท" error={e.subcategory}>
              <select
                id="subcategory"
                name="subcategory"
                className="input"
                value={values.subcategory}
                onChange={(ev) => set('subcategory', ev.target.value)}
              >
                <option value="">ไม่ระบุ</option>
                {category.subcategories.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {text(
            'reason',
            'รีวิวจากครู',
            'จากประสบการณ์ใช้จริง ห้ามแต่งเพิ่ม · เว้นบรรทัดว่างระหว่างย่อหน้า · ขึ้นต้นย่อหน้าด้วย "ข้อควรรู้:" ให้เป็นกล่องเตือน',
            8,
          )}
          {text('recommendedBy', 'ครูที่แนะนำ', 'เช่น ครูวุฒิ · เว้นว่าง = ไม่ระบุชื่อ')}
          {text(
            'priceNote',
            'ระดับราคา (ไม่บังคับ)',
            'ไม่ต้องใส่ตัวเลข ราคาเปลี่ยนบ่อย เช่น "ราคาสูงกว่าทั่วไป แต่คุ้ม"',
          )}
          {text('buyUrl', 'ลิงก์ซื้อ', 'ลิงก์ affiliate จาก Shopee หรือร้านค้า (https://)')}
          <Field id="imageUrl" label="รูป" error={e.imageUrl}>
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
            // eslint-disable-next-line @next/next/no-img-element -- preview of the item photo
            <img src={values.imageUrl} alt="" className="admin-article-cover" />
          )}
          {text('sort', 'ลำดับ', 'เลขน้อยขึ้นก่อน · เว้นว่าง = 0')}
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
