import Link from 'next/link'
import { categories, getCategory } from '@/data/categories'
import { placeCategories } from '@/data/places'
import { findArea } from '@/data/areas'
import { listAllPlaces } from '@/lib/admin-places'
import { byPinnedAt } from '@/lib/places'
import { backfillCoordsAction } from '../actions'
import { requireAdminPage } from '@/lib/admin-page'
import { formatDay } from '@/lib/format'

type Props = {
  searchParams: Promise<{ q?: string; c?: string; h?: string; saved?: string; coords?: string }>
}

export default async function AdminPlaces({ searchParams }: Props) {
  await requireAdminPage()
  const { q, c, h, saved, coords } = await searchParams
  const everything = await listAllPlaces(q)
  // "Hidden only": the ones still being worked on before they go live.
  const hiddenOnly = h === '1'
  const hiddenCount = everything.filter((p) => p.published === false).length
  const all = hiddenOnly ? everything.filter((p) => p.published === false) : everything
  const missingCoords = everything.filter((p) => p.mapsUrl && p.lat == null).length
  // A place counts under every category it is listed in, main or extra.
  const current = getCategory(c ?? '')
  const places = current
    ? all
        .filter((p) => placeCategories(p).includes(current.slug))
        // Pinned first, as on the site.
        .sort(
          (a, b) =>
            Number(!!b.pinnedIn?.includes(current.slug)) - Number(!!a.pinnedIn?.includes(current.slug)) ||
            (a.pinnedIn?.includes(current.slug) ? byPinnedAt(a, b) : 0),
        )
    : all
  const countIn = (slug: string) => all.filter((p) => placeCategories(p).includes(slug)).length
  const tabHref = (slug?: string, hidden = hiddenOnly) => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (slug) sp.set('c', slug)
    if (hidden) sp.set('h', '1')
    return `/admin/places${sp.size ? `?${sp}` : ''}`
  }
  const [coordsFound, coordsTried] = (coords ?? '').split('-').map(Number)

  return (
    <>
      <div className="admin-titlebar">
        <h1>รายการบนเว็บ</h1>
        <div className="admin-titlebar__actions">
          <Link href="/admin/places/import" className="btn btn--secondary btn--sm">
            นำเข้าข้อมูล
          </Link>
          <Link href="/admin/places/new" className="btn btn--primary btn--sm">
            + เพิ่มรายการ
          </Link>
        </div>
      </div>
      {saved && (
        <p className="admin-notice" role="status">
          บันทึกแล้ว · <Link href={`/place/${saved}`}>ดูบนเว็บ</Link>
        </p>
      )}
      {coords && (
        <p className="admin-notice" role="status">
          ดึงพิกัดได้ {coordsFound} จาก {coordsTried} รายการ
          {coordsFound < coordsTried && ' · ที่เหลือให้เปิดแก้ไขแล้ววางพิกัดเอง'}
        </p>
      )}
      {missingCoords > 0 && (
        <form action={backfillCoordsAction} className="admin-notice">
          {missingCoords} รายการมีลิงก์ Google Maps แต่ยังไม่มีพิกัด (ใช้กับปุ่ม &quot;ใกล้ฉัน&quot;){' '}
          <button type="submit" className="btn btn--secondary btn--sm">
            ดึงพิกัดจากลิงก์
          </button>
        </form>
      )}
      <form className="admin-search" role="search">
        {current && <input type="hidden" name="c" value={current.slug} />}
        {hiddenOnly && <input type="hidden" name="h" value="1" />}
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
      <nav className="admin-tabs" aria-label="หมวด">
        <Link href={tabHref()} className="chip" aria-current={!current ? 'page' : undefined}>
          ทั้งหมด {all.length}
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={tabHref(cat.slug)}
            className="chip"
            aria-current={current?.slug === cat.slug ? 'page' : undefined}
          >
            {cat.name} {countIn(cat.slug)}
          </Link>
        ))}
      </nav>
      <nav className="admin-tabs" aria-label="สถานะ">
        <Link
          href={tabHref(current?.slug, !hiddenOnly)}
          className="chip"
          aria-current={hiddenOnly ? 'page' : undefined}
        >
          เฉพาะที่ซ่อนอยู่ {hiddenCount}
        </Link>
      </nav>
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
                    {current && p.pinnedIn?.includes(current.slug) && (
                      <span className="admin-badge admin-badge--pin">ปักหมุด</span>
                    )}
                    {!current && !!p.pinnedIn?.length && (
                      <span className="admin-badge admin-badge--pin">ปักหมุด</span>
                    )}
                    {p.published === false && <span className="admin-badge">ซ่อนอยู่</span>}
                    {p.lat == null && !p.serviceAreas?.length && (
                      <span className="admin-badge">ไม่มีพิกัด</span>
                    )}
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
