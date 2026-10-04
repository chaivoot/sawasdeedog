import { ConfirmSubmit } from '@/components/ConfirmSubmit'
import { requireAdminPage } from '@/lib/admin-page'
import { photoReport } from '@/lib/place-photos'
import { isSupabaseConfigured } from '@/lib/supabase'
import { deleteOrphansAction, makeThumbsAction } from './actions'

type Props = { searchParams: Promise<{ thumbs?: string; deleted?: string }> }

const mb = (bytes: number) =>
  `${(bytes / 1024 / 1024).toLocaleString('th-TH', { maximumFractionDigits: 1 })} MB`

export default async function AdminPhotos({ searchParams }: Props) {
  await requireAdminPage()
  const { thumbs, deleted } = await searchParams

  if (!isSupabaseConfigured())
    return (
      <>
        <h1>รูปภาพ</h1>
        <p className="admin-empty">ยังไม่ได้ตั้งค่า Supabase</p>
      </>
    )

  const r = await photoReport()

  return (
    <>
      <h1>รูปภาพ</h1>
      {thumbs && (
        <p className="admin-notice" role="status">
          สร้างรูปย่อแล้ว {thumbs} รูป
        </p>
      )}
      {deleted && (
        <p className="admin-notice" role="status">
          ลบไฟล์ที่ไม่ได้ใช้แล้ว {deleted} ไฟล์
        </p>
      )}

      <dl className="admin-stats">
        <div>
          <dt>ไฟล์ทั้งหมด</dt>
          <dd>
            {r.files.toLocaleString('th-TH')} ไฟล์ · {mb(r.bytes)}
          </dd>
        </div>
        <div>
          <dt>โควตาฟรีของ Supabase Storage</dt>
          <dd>1 GB (ใช้ไป {((r.bytes / 1024 ** 3) * 100).toFixed(1)}%)</dd>
        </div>
      </dl>

      <section className="admin-section">
        <h2>รูปย่อสำหรับการ์ด</h2>
        <p className="admin-hint">
          การ์ดในหน้ารายการโหลดรูปย่อ (กว้างไม่เกิน 640px) แทนรูปเต็ม หน้าเว็บจึงเบาลงมาก
          รูปที่อัปตั้งแต่นี้มีรูปย่อให้เอง
        </p>
        {r.missingThumbs.length > 0 ? (
          <form action={makeThumbsAction} className="admin-notice">
            รูปเดิม {r.missingThumbs.length} รูปยังไม่มีรูปย่อ{' '}
            <button type="submit" className="btn btn--secondary btn--sm">
              สร้างรูปย่อ (ครั้งละ 30 รูป)
            </button>
          </form>
        ) : (
          <p className="admin-hint">ทุกรูปมีรูปย่อแล้ว</p>
        )}
      </section>

      <section className="admin-section">
        <h2>ไฟล์ที่ไม่ได้ใช้</h2>
        <p className="admin-hint">
          รูปที่ไม่มีรายการไหนใช้แล้ว เช่น อัปไว้แต่ไม่ได้กดบันทึก (เก็บไว้ 1 วันก่อนนับว่าไม่ได้ใช้)
          ส่วนรูปที่ลบออกจากรายการ ระบบลบไฟล์ให้ทันที
        </p>
        {r.orphans.length > 0 ? (
          <>
            <details>
              <summary>
                {r.orphans.length} ไฟล์ · {mb(r.orphanBytes)}
              </summary>
              <ul className="admin-files">
                {r.orphans.map((f) => (
                  <li key={f.path}>
                    <code>{f.path}</code> · {Math.round(f.size / 1024)} KB
                  </li>
                ))}
              </ul>
            </details>
            <form action={deleteOrphansAction} className="admin-danger">
              <ConfirmSubmit message={`ลบ ${r.orphans.length} ไฟล์ที่ไม่ได้ใช้? กู้คืนไม่ได้`}>
                ลบไฟล์ที่ไม่ได้ใช้
              </ConfirmSubmit>
            </form>
          </>
        ) : (
          <p className="admin-hint">ไม่มีไฟล์ค้าง</p>
        )}
      </section>
    </>
  )
}
