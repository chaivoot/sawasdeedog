import { PendingSubmit } from '@/components/PendingSubmit'
import { requireAdminPage } from '@/lib/admin-page'
import Link from 'next/link'
import {
  dueUrls,
  inScope,
  listIndexStatus,
  sitemapUrls,
  type IndexScope,
  type IndexStatus,
} from '@/lib/index-status'
import {
  inspectInConsoleUrl,
  isSearchConsoleConfigured,
  searchAnalytics,
  searchConsoleProperty,
  type SearchRow,
} from '@/lib/search-console'
import { siteUrl } from '@/lib/site'
import { isSupabaseConfigured } from '@/lib/supabase'
import { inspectBatchAction } from './actions'

// Inspecting a batch of pages takes a while.
export const maxDuration = 60

type Props = { searchParams: Promise<{ checked?: string; failed?: string; scope?: string }> }

const num = (n: number) => Math.round(n).toLocaleString('th-TH')
const pct = (n: number) => `${(n * 100).toLocaleString('th-TH', { maximumFractionDigits: 1 })}%`
const pos = (n: number) => n.toLocaleString('th-TH', { maximumFractionDigits: 1 })
const dateFmt = new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
  dateStyle: 'medium',
  timeZone: 'Asia/Bangkok',
})
const date = (iso: string | null) => (iso ? dateFmt.format(new Date(iso)) : '—')

/** Path only, so the tables stay readable. */
function path(url: string) {
  try {
    return decodeURI(new URL(url).pathname)
  } catch {
    return url
  }
}

export default async function AdminSearch({ searchParams }: Props) {
  await requireAdminPage()
  const { checked, failed, scope: scopeParam } = await searchParams
  const scope: IndexScope = scopeParam === 'all' ? 'all' : 'place'

  if (!isSearchConsoleConfigured())
    return (
      <>
        <h1>Google</h1>
        <p className="admin-empty">
          ยังไม่ได้ตั้งค่า <code>GSC_SERVICE_ACCOUNT_JSON</code> ใน Vercel (หรือค่าไม่ใช่ไฟล์ JSON ของ Service
          Account) ตั้งแล้วต้อง redeploy ก่อน
        </p>
      </>
    )

  let site: string
  let totals: SearchRow | undefined
  let queries: SearchRow[] = []
  let pages: SearchRow[] = []
  try {
    site = await searchConsoleProperty()
    ;[[totals], queries, pages] = await Promise.all([
      searchAnalytics(null),
      searchAnalytics('query', 28, 250),
      searchAnalytics('page', 28, 30),
    ])
  } catch (e) {
    return (
      <>
        <h1>Google</h1>
        <p className="admin-empty">
          ดึงข้อมูลจาก Search Console ไม่ได้: {e instanceof Error ? e.message : String(e)}
        </p>
      </>
    )
  }

  // Seen often but ranked below the top few: the queries a better page could win.
  const nearly = queries
    .filter((q) => q.position >= 4 && q.position <= 20 && q.impressions >= 5)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)

  return (
    <>
      <h1>Google</h1>
      <p className="admin-hint">
        ข้อมูลจาก Search Console ({site}) ย้อนหลัง 28 วัน ข้อมูลช้ากว่าจริงราว 2 วัน
      </p>

      <dl className="admin-stats">
        <div>
          <dt>คลิกจาก Google</dt>
          <dd>{num(totals?.clicks ?? 0)}</dd>
        </div>
        <div>
          <dt>ขึ้นในผลค้นหา</dt>
          <dd>{num(totals?.impressions ?? 0)} ครั้ง</dd>
        </div>
        <div>
          <dt>อัตราคลิก</dt>
          <dd>{pct(totals?.ctr ?? 0)}</dd>
        </div>
        <div>
          <dt>อันดับเฉลี่ย</dt>
          <dd>{totals ? pos(totals.position) : '—'}</dd>
        </div>
      </dl>

      <section className="admin-section">
        <h2>คำที่คนค้นแล้วเจอเรา</h2>
        <SearchTable rows={queries.slice(0, 50)} label="คำค้น" />
      </section>

      <section className="admin-section">
        <h2>คำที่เกือบติดอันดับต้น</h2>
        <p className="admin-hint">
          ขึ้นในผลค้นหาบ่อย แต่อยู่อันดับ 4–20 ทำหน้าหรือบทความให้ตอบคำนี้ตรงขึ้น มีโอกาสได้คลิกเพิ่ม
        </p>
        <SearchTable rows={nearly} label="คำค้น" />
      </section>

      <section className="admin-section">
        <h2>หน้าที่คนเข้าจาก Google</h2>
        <SearchTable rows={pages} label="หน้า" link />
      </section>

      <IndexSection site={site} scope={scope} checked={checked} failed={failed} />
    </>
  )
}

function SearchTable({ rows, label, link }: { rows: SearchRow[]; label: string; link?: boolean }) {
  if (rows.length === 0) return <p className="admin-hint">ยังไม่มีข้อมูล</p>
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>{label}</th>
            <th>คลิก</th>
            <th>ขึ้นผลค้นหา</th>
            <th>อันดับ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>
                {link ? (
                  <a href={r.key} target="_blank" rel="noreferrer">
                    {path(r.key)}
                  </a>
                ) : (
                  r.key
                )}
              </td>
              <td>{num(r.clicks)}</td>
              <td>{num(r.impressions)}</td>
              <td>{pos(r.position)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

async function IndexSection({
  site,
  scope,
  checked,
  failed,
}: {
  site: string
  scope: IndexScope
  checked?: string
  failed?: string
}) {
  if (!isSupabaseConfigured())
    return (
      <section className="admin-section" id="index">
        <h2>หน้าที่ติด Google แล้วหรือยัง</h2>
        <p className="admin-hint">ยังไม่ได้ตั้งค่า Supabase</p>
      </section>
    )

  let urls: string[]
  let statuses: IndexStatus[]
  try {
    ;[urls, statuses] = await Promise.all([sitemapUrls(), listIndexStatus()])
    urls = urls.filter((u) => inScope(u, scope))
  } catch (e) {
    return (
      <section className="admin-section" id="index">
        <h2>หน้าที่ติด Google แล้วหรือยัง</h2>
        <p className="admin-empty">
          อ่านผลตรวจไม่ได้ (รัน SQL <code>0010_index_status.sql</code> แล้วหรือยัง):{' '}
          {e instanceof Error ? e.message : String(e)}
        </p>
      </section>
    )
  }

  const byUrl = new Map(statuses.map((s) => [s.url, s]))
  const ours = urls.map((u) => ({ url: u, s: byUrl.get(u) }))
  const indexed = ours.filter((x) => x.s?.verdict === 'PASS')
  const notIndexed = ours.filter((x) => x.s && !x.s.error && x.s.verdict !== 'PASS')
  const errored = ours.filter((x) => x.s?.error)
  const unchecked = ours.filter((x) => !x.s)
  const dueCount = dueUrls(urls, statuses).length
  const home = siteUrl()

  return (
    <section className="admin-section" id="index">
      <h2>หน้าที่ติด Google แล้วหรือยัง</h2>
      <p className="admin-hint">
        ตรวจทุกหน้าใน sitemap ทีละหน้าผ่าน URL Inspection API (ได้วันละ 2,000 หน้า) หน้าไหนยังไม่ติด
        กดลิงก์เพื่อเปิดใน Search Console แล้วกด &quot;ขอการจัดทำดัชนี&quot; (Request indexing) เอง
        ปุ่มนี้กดผ่าน API ไม่ได้
      </p>
      <nav className="admin-tabs" aria-label="หน้าที่ตรวจ">
        <Link href="/admin/search?scope=place#index" aria-current={scope === 'place' ? 'page' : undefined}>
          หน้าร้าน (/place)
        </Link>
        <Link href="/admin/search?scope=all#index" aria-current={scope === 'all' ? 'page' : undefined}>
          ทุกหน้า
        </Link>
      </nav>
      {failed && (
        <p className="admin-warning" role="alert">
          ตรวจไม่สำเร็จ: {failed}
        </p>
      )}
      {checked && (
        <p className="admin-notice" role="status">
          ตรวจแล้ว {checked} หน้า
        </p>
      )}

      <dl className="admin-stats">
        <div>
          <dt>ติด Google แล้ว</dt>
          <dd>{indexed.length} หน้า</dd>
        </div>
        <div>
          <dt>ยังไม่ติด</dt>
          <dd>{notIndexed.length} หน้า</dd>
        </div>
        <div>
          <dt>ยังไม่ได้ตรวจ</dt>
          <dd>{unchecked.length} หน้า</dd>
        </div>
        {errored.length > 0 && (
          <div>
            <dt>ตรวจไม่สำเร็จ</dt>
            <dd>{errored.length} หน้า</dd>
          </div>
        )}
      </dl>

      {dueCount > 0 ? (
        <form action={inspectBatchAction} className="admin-notice">
          <input type="hidden" name="scope" value={scope} />
          ถึงรอบตรวจ {dueCount} หน้า{' '}
          <PendingSubmit pending="กำลังตรวจทีละหน้ากับ Google ใช้เวลาราว 15–40 วินาที อย่าปิดหน้านี้">
            ตรวจ (ครั้งละ 30 หน้า)
          </PendingSubmit>
        </form>
      ) : (
        <p className="admin-hint">
          ทุกหน้าตรวจล่าสุดแล้ว (หน้าที่ติดแล้วตรวจซ้ำทุก 14 วัน ที่ยังไม่ติดทุก 3 วัน)
        </p>
      )}

      {notIndexed.length + errored.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>หน้า</th>
                <th>สถานะจาก Google</th>
                <th>Google เข้ามาล่าสุด</th>
                <th>ตรวจเมื่อ</th>
              </tr>
            </thead>
            <tbody>
              {[...notIndexed, ...errored].map(({ url, s }) => (
                <tr key={url}>
                  <td>
                    <a href={inspectInConsoleUrl(site, url)} target="_blank" rel="noreferrer">
                      {url === home || url === `${home}/` ? '/' : path(url)}
                    </a>
                  </td>
                  <td>
                    {s?.error ? `ตรวจไม่สำเร็จ: ${s.error}` : (s?.coverageState ?? s?.verdict)}
                    {s?.googleCanonical && s.userCanonical && s.googleCanonical !== s.userCanonical && (
                      <> · Google เลือกหน้าอื่นเป็นหลัก: {path(s.googleCanonical)}</>
                    )}
                  </td>
                  <td>{date(s?.lastCrawlTime ?? null)}</td>
                  <td>{date(s?.checkedAt ?? null)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {indexed.length > 0 && (
        <details>
          <summary>หน้าที่ติดแล้ว {indexed.length} หน้า</summary>
          <ul className="admin-files">
            {indexed.map(({ url, s }) => (
              <li key={url}>
                {path(url)} · Google เข้ามาล่าสุด {date(s?.lastCrawlTime ?? null)}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
