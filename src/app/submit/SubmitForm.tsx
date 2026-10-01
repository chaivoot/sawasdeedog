'use client'

import { startTransition, useActionState, useEffect, useMemo, useState } from 'react'
import { categories } from '@/data/categories'
import { provinces } from '@/data/areas'
import { Icon } from '@/components/Icon'
import { MAX_PHOTOS } from '@/lib/limits'
import { submitAction, type FormState } from './actions'

type Props = {
  initialKind: 'new' | 'report'
  initialCategory?: string
  reportPlace?: { slug: string; name: string }
}

export function SubmitForm({ initialKind, initialCategory, reportPlace }: Props) {
  const [kind, setKind] = useState(initialKind)
  const [state, action, pending] = useActionState<FormState, FormData>(submitAction, {})
  const [category, setCategory] = useState(initialCategory ?? '')
  const [province, setProvince] = useState('bangkok')
  const [photos, setPhotos] = useState<File[]>([])
  const errors = state.errors ?? {}
  const districts = provinces.find((p) => p.slug === province)?.districts ?? []

  return (
    <form
      className="form"
      noValidate
      onSubmit={(e) => {
        // Submitting manually (instead of <form action>) keeps the typed values
        // when the server returns validation errors, and lets us attach photos.
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        photos.forEach((p) => data.append('photos', p))
        startTransition(() => action(data))
      }}
    >
      <div className="segmented segmented--tall" role="tablist" aria-label="ประเภทการส่ง">
        <button type="button" role="tab" aria-selected={kind === 'new'} onClick={() => setKind('new')}>
          เสนอสถานที่ใหม่
        </button>
        <button type="button" role="tab" aria-selected={kind === 'report'} onClick={() => setKind('report')}>
          แจ้งข้อมูลผิด
        </button>
      </div>
      <input type="hidden" name="kind" value={kind} />

      {state.message && (
        <p className="auth__error" role="alert">
          {state.message}
        </p>
      )}

      {kind === 'new' ? (
        <div className="form__grid--stack">
          <Field id="name" label="ชื่อสถานที่" error={errors.name}>
            <input
              id="name"
              name="name"
              className="input"
              placeholder="เช่น ชื่อร้าน หรือชื่อครูฝึก"
              required
              aria-invalid={!!errors.name}
            />
          </Field>
          <Field id="category" label="หมวด" error={errors.category}>
            <select
              id="category"
              name="category"
              className="select"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-invalid={!!errors.category}
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
          <Field
            id="mapsUrl"
            label="ลิงก์ Google Maps"
            hint="เปิด Google Maps กดแชร์ แล้วคัดลอกลิงก์มาวาง"
            error={errors.mapsUrl}
            full
          >
            <input
              id="mapsUrl"
              name="mapsUrl"
              type="url"
              inputMode="url"
              className="input"
              placeholder="วางลิงก์จาก Google Maps"
              required
              aria-invalid={!!errors.mapsUrl}
            />
          </Field>
          <div className="form__grid field--full">
            <Field id="province" label="จังหวัด" error={errors.province}>
              <select
                id="province"
                name="province"
                className="select"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                aria-invalid={!!errors.province}
              >
                {provinces.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="district" label="เขต / อำเภอ" error={errors.district}>
              <select
                id="district"
                name="district"
                className="select"
                defaultValue=""
                key={province}
                disabled={districts.length === 0}
                aria-invalid={!!errors.district}
              >
                <option value="">{districts.length ? 'เลือก' : 'ไม่ต้องเลือก'}</option>
                {districts.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field id="note" label="โน้ตถึงทีม" hint="ไม่บังคับ" full>
            <textarea
              id="note"
              name="note"
              className="textarea"
              placeholder="ทำไมที่นี่ถึงดี หรือมีอะไรที่ทีมควรรู้"
            />
          </Field>
          <PhotoField files={photos} setFiles={setPhotos} error={errors.photos} />
        </div>
      ) : (
        <div className="form__grid--stack">
          {reportPlace ? (
            <Field id="placeName" label="สถานที่" full>
              <input type="hidden" name="place" value={reportPlace.slug} />
              <input id="placeName" name="placeName" className="input" value={reportPlace.name} readOnly />
            </Field>
          ) : (
            <Field id="placeName" label="สถานที่ที่ข้อมูลไม่ตรง" error={errors.placeName} full>
              <input
                id="placeName"
                name="placeName"
                className="input"
                placeholder="ชื่อสถานที่บนเว็บ"
                required
                aria-invalid={!!errors.placeName}
              />
            </Field>
          )}
          <Field id="details" label="ข้อมูลไหนไม่ตรง" error={errors.details} full>
            <textarea
              id="details"
              name="details"
              className="textarea"
              placeholder="เช่น ย้ายร้านแล้ว เวลาเปิดเปลี่ยน หรือไม่ให้หมาเข้าห้องแอร์แล้ว"
              required
              aria-invalid={!!errors.details}
            />
          </Field>
          <PhotoField files={photos} setFiles={setPhotos} error={errors.photos} />
        </div>
      )}

      <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={pending}>
        {pending ? 'กำลังส่ง…' : 'ส่งให้ทีมตรวจ'}
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

function PhotoField({
  files,
  setFiles,
  error,
}: {
  files: File[]
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
  error?: string
}) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  return (
    <div className="field field--full">
      <span className="field__label" id="photos-label">
        แนบรูป
      </span>
      <div className="photo-picker" role="group" aria-labelledby="photos-label">
        {files.length < MAX_PHOTOS && (
          <label className="photo-picker__add">
            <Icon name="camera" size={24} strokeWidth={1.9} />
            เพิ่มรูป
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? [])
                e.target.value = ''
                setFiles((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS))
              }}
            />
          </label>
        )}
        {previews.map((src, i) => (
          <div key={src} className="photo photo-picker__item">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img src={src} alt={`รูปที่แนบ ${i + 1}`} />
            <button
              type="button"
              className="photo-picker__remove"
              aria-label={`ลบรูปที่ ${i + 1}`}
              onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
            >
              <Icon name="x" size={16} strokeWidth={2.2} />
            </button>
          </div>
        ))}
      </div>
      {error ? (
        <span className="field__error" role="alert">
          {error}
        </span>
      ) : (
        <span className="field__hint">ไม่บังคับ สูงสุด {MAX_PHOTOS} รูป</span>
      )}
    </div>
  )
}
