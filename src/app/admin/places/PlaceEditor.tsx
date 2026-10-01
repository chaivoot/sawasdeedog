'use client'

import { startTransition, useActionState, useState } from 'react'
import { categories, getCategory, trainerStyles } from '@/data/categories'
import { provinces } from '@/data/areas'
import { breeds } from '@/data/breeds'
import { dogFriendly, hasDogFriendlyRule } from '@/data/criteria'
import type { Contacts } from '@/data/places'
import { Icon } from '@/components/Icon'
import { MAX_PLACE_PHOTOS } from '@/lib/limits'
import { uploadPhotos } from '@/lib/upload-client'
import { savePlaceAction, type PlaceFormState } from '../actions'

export type PlaceDraft = {
  id?: string
  name: string
  slug: string
  category: string
  type?: string
  trainerStyle?: string
  province: string
  district: string
  checkedAt: string
  description?: string
  attributes: string[]
  hours?: string
  price?: string
  contacts: Contacts
  mapsUrl: string
  photos: string[]
  breeds: string[]
  published: boolean
}

export function PlaceEditor({ draft, fromSubmission }: { draft: PlaceDraft; fromSubmission?: string }) {
  const [state, action, pending] = useActionState<PlaceFormState, FormData>(savePlaceAction, {})
  const [categorySlug, setCategorySlug] = useState(draft.category)
  const [province, setProvince] = useState(draft.province)
  const [photos, setPhotos] = useState(draft.photos)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const category = getCategory(categorySlug)
  const districts = provinces.find((p) => p.slug === province)?.districts ?? []
  const e = state.errors ?? {}

  async function addPhotos(files: File[]) {
    const room = MAX_PLACE_PHOTOS - photos.length
    if (room <= 0) return
    setUploading(true)
    setUploadError('')
    try {
      const done = await uploadPhotos(files.slice(0, room), 'place')
      if (done.length === 0) setUploadError('ยังไม่ได้ตั้งค่า Supabase จึงอัปโหลดรูปไม่ได้')
      setPhotos((prev) => [...prev, ...done.map((d) => d.publicUrl!).filter(Boolean)])
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ')
    } finally {
      setUploading(false)
    }
  }

  function move(i: number, by: number) {
    setPhotos((prev) => {
      const next = [...prev]
      const j = i + by
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  return (
    <form
      className="form admin-form"
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault()
        if (pending || uploading) return
        const data = new FormData(ev.currentTarget)
        data.set('photos', JSON.stringify(photos))
        startTransition(() => action(data))
      }}
    >
      {draft.id && <input type="hidden" name="id" value={draft.id} />}
      {fromSubmission && <input type="hidden" name="fromSubmission" value={fromSubmission} />}

      {state.message && (
        <p className="auth__error" role="alert">
          {state.message}
        </p>
      )}
      {Object.keys(e).length > 0 && (
        <p className="auth__error" role="alert">
          ยังบันทึกไม่ได้ ตรวจช่องที่มีข้อความสีแดง
        </p>
      )}

      <fieldset className="admin-fieldset">
        <legend>ข้อมูลหลัก</legend>
        <div className="form__grid--stack">
          <Field id="name" label="ชื่อ" error={e.name}>
            <input id="name" name="name" className="input" defaultValue={draft.name} required />
          </Field>
          <Field
            id="slug"
            label="slug (ส่วนท้ายลิงก์)"
            hint="a-z 0-9 และ - · เว้นว่างให้ระบบตั้งให้"
            error={e.slug}
          >
            <input
              id="slug"
              name="slug"
              className="input"
              defaultValue={draft.slug}
              placeholder="เช่น cafe-lat-krabang-a"
            />
          </Field>
          <Field id="category" label="หมวด" error={e.category}>
            <select
              id="category"
              name="category"
              className="select"
              value={categorySlug}
              onChange={(ev) => setCategorySlug(ev.target.value)}
              required
            >
              <option value="" disabled>
                เลือกหมวด
              </option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          {category?.types && (
            <Field id="type" label="ประเภท" error={e.type}>
              <select
                id="type"
                name="type"
                className="select"
                defaultValue={draft.type ?? ''}
                key={categorySlug}
              >
                <option value="">ไม่ระบุ</option>
                {category.types.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {categorySlug === 'trainer' && (
            <Field id="trainerStyle" label="แนวการฝึก" error={e.trainerStyle}>
              <select
                id="trainerStyle"
                name="trainerStyle"
                className="select"
                defaultValue={draft.trainerStyle ?? ''}
              >
                <option value="" disabled>
                  เลือก
                </option>
                {trainerStyles.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <div className="form__grid field--full">
            <Field id="province" label="จังหวัด" error={e.province}>
              <select
                id="province"
                name="province"
                className="select"
                value={province}
                onChange={(ev) => setProvince(ev.target.value)}
              >
                {provinces.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="district" label="เขต / อำเภอ" error={e.district}>
              <select
                id="district"
                name="district"
                className="select"
                defaultValue={province === draft.province ? draft.district : ''}
                key={province}
              >
                <option value="">{districts.length ? 'ไม่ระบุ' : 'ไม่มีให้เลือก'}</option>
                {districts.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field id="mapsUrl" label="ลิงก์ Google Maps" error={e.mapsUrl} full>
            <input
              id="mapsUrl"
              name="mapsUrl"
              type="url"
              className="input"
              defaultValue={draft.mapsUrl}
              required
            />
          </Field>
          <Field id="checkedAt" label="วันที่ทีมเช็คล่าสุด" error={e.checkedAt}>
            <input
              id="checkedAt"
              name="checkedAt"
              type="date"
              className="input"
              defaultValue={draft.checkedAt}
            />
          </Field>
          <div className="field">
            <span className="field__label">การแสดงผล</span>
            <label className="checkbox">
              <input type="checkbox" name="published" defaultChecked={draft.published} />
              แสดงบนเว็บ
            </label>
          </div>
        </div>
      </fieldset>

      {category && category.filters.length > 0 && (
        <fieldset className="admin-fieldset" key={`f-${categorySlug}`}>
          <legend>ผ่านเกณฑ์อะไรบ้าง</legend>
          {hasDogFriendlyRule(category.slug) && (
            <p className="field__hint">ทุกรายการต้องผ่าน: {dogFriendly.criterion}</p>
          )}
          <div className="admin-checks">
            {category.filters.map((f) => (
              <label key={f.slug} className="checkbox">
                <input
                  type="checkbox"
                  name="attributes"
                  value={f.slug}
                  defaultChecked={draft.attributes.includes(f.slug)}
                />
                {f.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {categorySlug === 'farm' && (
        <fieldset className="admin-fieldset">
          <legend>สายพันธุ์</legend>
          {e.breeds && <span className="field__error">{e.breeds}</span>}
          <div className="admin-checks">
            {breeds.map((b) => (
              <label key={b.slug} className="checkbox">
                <input
                  type="checkbox"
                  name="breeds"
                  value={b.slug}
                  defaultChecked={draft.breeds.includes(b.slug)}
                />
                {b.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="admin-fieldset">
        <legend>รายละเอียด</legend>
        <div className="form__grid--stack">
          <Field id="description" label="คำอธิบายจากทีม" hint="2-4 บรรทัด" full>
            <textarea
              id="description"
              name="description"
              className="textarea"
              defaultValue={draft.description}
            />
          </Field>
          <Field id="hours" label="เวลาเปิด">
            <textarea
              id="hours"
              name="hours"
              className="textarea textarea--short"
              defaultValue={draft.hours}
            />
          </Field>
          <Field id="price" label="ราคา">
            <textarea
              id="price"
              name="price"
              className="textarea textarea--short"
              defaultValue={draft.price}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>ช่องทางติดต่อ (ใส่เฉพาะที่มี)</legend>
        <div className="form__grid--stack">
          <Field id="phone" label="โทร">
            <input id="phone" name="phone" type="tel" className="input" defaultValue={draft.contacts.phone} />
          </Field>
          <Field id="line" label="LINE ID" hint="ขึ้นต้นด้วย @ ถ้าเป็นบัญชีทางการ">
            <input id="line" name="line" className="input" defaultValue={draft.contacts.line} />
          </Field>
          <Field id="instagram" label="Instagram">
            <input
              id="instagram"
              name="instagram"
              className="input"
              defaultValue={draft.contacts.instagram}
            />
          </Field>
          <Field id="facebook" label="ลิงก์ Facebook" error={e.facebook}>
            <input
              id="facebook"
              name="facebook"
              type="url"
              className="input"
              defaultValue={draft.contacts.facebook}
            />
          </Field>
          <Field id="website" label="เว็บไซต์" error={e.website} full>
            <input
              id="website"
              name="website"
              type="url"
              className="input"
              defaultValue={draft.contacts.website}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>
          รูป ({photos.length}/{MAX_PLACE_PHOTOS}) · รูปแรกคือรูปปก
        </legend>
        <div className="photo-picker">
          {photos.map((src, i) => (
            <div key={src} className="photo photo-picker__item admin-photo">
              {/* eslint-disable-next-line @next/next/no-img-element -- storage URL */}
              <img src={src} alt={`รูปที่ ${i + 1}`} />
              <button
                type="button"
                className="photo-picker__remove"
                aria-label={`ลบรูปที่ ${i + 1}`}
                onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
              >
                <Icon name="x" size={16} strokeWidth={2.2} />
              </button>
              {i > 0 && (
                <button
                  type="button"
                  className="admin-photo__left"
                  aria-label={`เลื่อนรูปที่ ${i + 1} ไปซ้าย`}
                  onClick={() => move(i, -1)}
                >
                  <Icon name="back" size={16} strokeWidth={2.2} />
                </button>
              )}
            </div>
          ))}
          {photos.length < MAX_PLACE_PHOTOS && (
            <label className="photo-picker__add" aria-busy={uploading}>
              <Icon name="camera" size={24} strokeWidth={1.9} />
              {uploading ? 'กำลังอัปโหลด…' : 'เพิ่มรูป'}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(ev) => {
                  const files = Array.from(ev.target.files ?? [])
                  ev.target.value = ''
                  if (files.length) addPhotos(files)
                }}
              />
            </label>
          )}
        </div>
        {(uploadError || e.photos) && <span className="field__error">{uploadError || e.photos}</span>}
      </fieldset>

      <button type="submit" className="btn btn--primary btn--lg" disabled={pending || uploading}>
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
  full,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  full?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={`field${full ? ' field--full' : ''}`}>
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
