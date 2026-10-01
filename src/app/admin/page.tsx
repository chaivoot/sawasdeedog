import Link from 'next/link'
import { getCategory } from '@/data/categories'
import { findArea } from '@/data/areas'
import { requireAdminPage } from '@/lib/admin-page'
import { listSubmissions, statusLabel, type SubmissionStatus } from '@/lib/submissions'

const tabs: { status: SubmissionStatus | 'all'; label: string }[] = [
  { status: 'pending', label: 'รอตรวจ' },
  { status: 'approved', label: 'ขึ้นเว็บแล้ว' },
  { status: 'resolved', label: 'แก้แล้ว' },
  { status: 'rejected', label: 'ไม่ผ่าน' },
  { status: 'all', label: 'ทั้งหมด' },
]

type Props = { searchParams: Promise<{ status?: string }> }

export default async function AdminHome({ searchParams }: Props) {
  await requireAdminPage()
  const requested = (await searchParams).status
  const status = tabs.find((t) => t.status === requested)?.status ?? 'pending'
  const rows = await listSubmissions(status)
  const dateFmt = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  })

  return (
    <>
      <h1>ข้อมูลที่ส่งมา</h1>
      <nav className="admin-tabs" aria-label="สถานะ">
        {tabs.map((t) => (
          <Link
            key={t.status}
            href={`/admin?status=${t.status}`}
            aria-current={t.status === status ? 'page' : undefined}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="admin-empty">ไม่มีรายการ</p>
      ) : (
        <ul className="admin-list">
          {rows.map((r) => {
            const title = r.kind === 'new' ? r.payload.name : r.payload.placeName
            const sub =
              r.kind === 'new'
                ? [getCategory(r.payload.category)?.name, areaLabel(r.payload.province, r.payload.district)]
                    .filter(Boolean)
                    .join(' · ')
                : r.payload.details
            return (
              <li key={r.id}>
                <Link href={`/admin/submissions/${r.id}`} className="admin-row">
                  <span className={`admin-badge admin-badge--${r.kind}`}>
                    {r.kind === 'new' ? 'เสนอใหม่' : 'แจ้งผิด'}
                  </span>
                  <span className="admin-row__main">
                    <b>{title}</b>
                    <span>{sub}</span>
                  </span>
                  <span className="admin-row__meta">
                    {status === 'all' && <span>{statusLabel[r.status]}</span>}
                    <span>{r.submitted_by_name}</span>
                    <span>{dateFmt.format(new Date(r.created_at))}</span>
                    {r.photos.length > 0 && <span>รูป {r.photos.length}</span>}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

function areaLabel(province: string, district?: string) {
  const a = findArea(province, district)
  return a ? [a.province.name, a.district?.name].filter(Boolean).join(' › ') : ''
}
