import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategory } from '@/data/categories'
import { findArea } from '@/data/areas'
import { requireAdminPage } from '@/lib/admin-page'
import { getPlace } from '@/lib/places'
import { getSubmission, statusLabel, submissionPhotoUrls } from '@/lib/submissions'
import { setSubmissionStatusAction } from '../../actions'

type Props = { params: Promise<{ id: string }> }

export default async function SubmissionPage({ params }: Props) {
  await requireAdminPage()
  const s = await getSubmission((await params).id)
  if (!s) notFound()
  const photos = await submissionPhotoUrls(s.photos)
  const place = s.place_slug ? await getPlace(s.place_slug) : undefined
  const dateFmt = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  })
  const area = s.kind === 'new' ? findArea(s.payload.province, s.payload.district) : undefined

  return (
    <>
      <Link href="/admin" className="admin-back">
        ← ข้อมูลที่ส่งมา
      </Link>
      <h1>{s.kind === 'new' ? s.payload.name : `แจ้งข้อมูลผิด: ${s.payload.placeName}`}</h1>
      <p className="admin-meta">
        {statusLabel[s.status]} · ส่งโดย {s.submitted_by_name} · {dateFmt.format(new Date(s.created_at))}
      </p>

      <dl className="admin-dl">
        {s.kind === 'new' ? (
          <>
            <dt>หมวด</dt>
            <dd>{getCategory(s.payload.category)?.name ?? s.payload.category}</dd>
            <dt>ย่าน</dt>
            <dd>{area ? [area.province.name, area.district?.name].filter(Boolean).join(' › ') : '-'}</dd>
            <dt>Google Maps</dt>
            <dd>
              {s.payload.mapsUrl ? (
                <a href={s.payload.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {s.payload.mapsUrl}
                </a>
              ) : (
                'ไม่มี (บริการถึงที่ / ไม่มีหน้าร้าน)'
              )}
            </dd>
            <dt>โน้ตถึงทีม</dt>
            <dd className="admin-pre">{s.payload.note || '-'}</dd>
          </>
        ) : (
          <>
            <dt>รายการ</dt>
            <dd>
              {place?.id ? (
                <Link href={`/admin/places/${place.id}`}>{place.name} (แก้ไข)</Link>
              ) : (
                s.payload.placeName
              )}
            </dd>
            <dt>ข้อมูลที่ไม่ตรง</dt>
            <dd className="admin-pre">{s.payload.details}</dd>
          </>
        )}
      </dl>

      {photos.length > 0 && (
        <div className="admin-photos">
          {photos.map((src, i) => (
            <a key={src} href={src} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URL */}
              <img src={src} alt={`รูปที่แนบ ${i + 1}`} />
            </a>
          ))}
        </div>
      )}

      <div className="admin-actions">
        {s.kind === 'new' && s.status === 'pending' && (
          <Link href={`/admin/places/new?submission=${s.id}`} className="btn btn--primary">
            สร้างรายการจากข้อมูลนี้
          </Link>
        )}
        {s.kind === 'report' && s.status === 'pending' && (
          <form action={setSubmissionStatusAction}>
            <input type="hidden" name="id" value={s.id} />
            <input type="hidden" name="status" value="resolved" />
            <button type="submit" className="btn btn--primary">
              แก้ข้อมูลแล้ว
            </button>
          </form>
        )}
        {s.status === 'pending' ? (
          <form action={setSubmissionStatusAction} className="admin-reject">
            <input type="hidden" name="id" value={s.id} />
            <input type="hidden" name="status" value="rejected" />
            <input
              name="note"
              className="input"
              placeholder="เหตุผล (ไม่บังคับ)"
              aria-label="เหตุผลที่ไม่ผ่าน"
            />
            <button type="submit" className="btn btn--secondary">
              ไม่ผ่านเกณฑ์
            </button>
          </form>
        ) : (
          <form action={setSubmissionStatusAction}>
            <input type="hidden" name="id" value={s.id} />
            <input type="hidden" name="status" value="pending" />
            <button type="submit" className="btn btn--secondary">
              ย้ายกลับไปรอตรวจ
            </button>
          </form>
        )}
      </div>
      {s.review_note && <p className="admin-meta">หมายเหตุ: {s.review_note}</p>}
    </>
  )
}
