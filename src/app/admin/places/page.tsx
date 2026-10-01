import Link from 'next/link'
import { getCategory } from '@/data/categories'
import { findArea } from '@/data/areas'
import { listAllPlaces } from '@/lib/admin-places'
import { requireAdminPage } from '@/lib/admin-page'
import { formatDay } from '@/lib/format'

type Props = { searchParams: Promise<{ q?: string; saved?: string }> }

export default async function AdminPlaces({ searchParams }: Props) {
  await requireAdminPage()
  const { q, saved } = await searchParams
  const places = await listAllPlaces(q)

  return (
    <>
      <div className="admin-titlebar">
        <h1>รายการบนเว็บ</h1>
        <Link href="/admin/places/new" className="btn btn--primary btn--sm">
          + เพิ่มรายการ
        </Link>
      </div>
      {saved && (
        <p className="admin-notice" role="status">
          บันทึกแล้ว · <Link href={`/place/${saved}`}>ดูบนเว็บ</Link>
        </p>
      )}
      <form className="admin-search" role="search">
        <input
          name="q"
          defaultValue={q}
          className="input"
          placeholder="ค้นหาชื่อหรือ slug"
          aria-label="ค้นหา"
        />
        <button type="submit" className="btn btn--secondary">
          ค้นหา
        </button>
      </form>
      {places.length === 0 ? (
        <p className="admin-empty">ไม่มีรายการ</p>
      ) : (
        <ul className="admin-list">
          {places.map((p) => {
            const area = findArea(p.province, p.district)
            return (
              <li key={p.id ?? p.slug}>
                <Link href={p.id ? `/admin/places/${p.id}` : `/place/${p.slug}`} className="admin-row">
                  <span className="admin-row__main">
                    <b>{p.name}</b>
                    <span>
                      {getCategory(p.category)?.name} ·{' '}
                      {area
                        ? [area.province.name, area.district?.name].filter(Boolean).join(' › ')
                        : p.province}
                    </span>
                  </span>
                  <span className="admin-row__meta">
                    {p.published === false && <span className="admin-badge">ซ่อนอยู่</span>}
                    <span>เช็ค {formatDay(p.checkedAt)}</span>
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
