import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { Photo } from '@/components/Photo'
import { SiteHeader } from '@/components/SiteHeader'
import { getCategory } from '@/data/categories'
import { getPlace } from '@/lib/places'
import { getSession } from '@/lib/session'
import { isAdmin } from '@/lib/admin'
import { SubmitForm } from './SubmitForm'

export const metadata: Metadata = {
  title: 'เสนอสถานที่',
  description: 'ช่วยเราคัดที่ดี ๆ ให้คนเลี้ยงหมา ทีมจะตรวจทุกรายการก่อนขึ้นเว็บ',
  robots: { index: false },
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

// Codes from /auth/line and its callback; the code in the URL tells the team which step failed.
const loginErrors: Record<string, string> = {
  line_cancel: 'ยกเลิกการเข้าสู่ระบบแล้ว กดปุ่มด้านล่างเพื่อลองอีกครั้ง',
  line_state: 'เข้าสู่ระบบไม่สำเร็จ (หมดเวลาหรือเปิดคนละแท็บ) ลองอีกครั้ง',
  line_denied: 'LINE ไม่อนุญาตการเข้าสู่ระบบ (รหัส line_denied) แจ้งทีมได้เลย',
  line_token: 'เข้าสู่ระบบด้วย LINE ไม่สำเร็จ (รหัส line_token) ลองอีกครั้ง ถ้ายังไม่ได้แจ้งทีม',
  line_config: 'ระบบเข้าสู่ระบบยังไม่พร้อม (รหัส line_config) แจ้งทีมได้เลย',
  session_config: 'ระบบเข้าสู่ระบบยังไม่พร้อม (รหัส session_config) แจ้งทีมได้เลย',
  server: 'ระบบขัดข้องระหว่างเข้าสู่ระบบ (รหัส server) ลองอีกครั้ง ถ้ายังไม่ได้แจ้งทีม',
}

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function SubmitPage({ searchParams }: Props) {
  const sp = await searchParams
  const session = await getSession()
  const sent = one(sp.sent)
  const kind = one(sp.type) === 'report' ? 'report' : 'new'
  const place = await getPlace(one(sp.place) ?? '')
  const category = getCategory(one(sp.category) ?? '')?.slug
  const back = place ? `/place/${place.slug}` : '/'

  if (!session) {
    const here = new URLSearchParams()
    for (const [k, v] of Object.entries(sp)) if (k !== 'error' && typeof v === 'string') here.set(k, v)
    const next = `/submit${here.size ? `?${here}` : ''}`
    return (
      <>
        <SiteHeader back={back} />
        <main className="auth">
          <Image
            className="auth__logo"
            src="/logo-full.jpg"
            width={200}
            height={200}
            alt="SawasdeeDog"
            priority
          />
          <div className="auth__text">
            <h1>ช่วยเราคัดที่ดี ๆ ให้คนเลี้ยงหมา</h1>
            <p>เข้าสู่ระบบด้วย LINE ก่อนเสนอสถานที่หรือแจ้งข้อมูลผิด ทีมจะตรวจทุกรายการก่อนขึ้นเว็บ</p>
          </div>
          <ul className="check-list">
            <li>
              <Icon name="check" size={20} strokeWidth={2.4} />
              เสนอสถานที่ใหม่
            </li>
            <li>
              <Icon name="check" size={20} strokeWidth={2.4} />
              แจ้งข้อมูลที่ไม่ตรงของรายการเดิม
            </li>
            <li>
              <Icon name="check" size={20} strokeWidth={2.4} />
              แนบรูปให้ทีมดูประกอบ
            </li>
          </ul>
          <div className="auth__actions">
            {sp.error && (
              <p className="auth__error" role="alert">
                {loginErrors[one(sp.error) ?? ''] ?? loginErrors.line_token}
              </p>
            )}
            {/* Route handler redirect, so a plain <a> rather than <Link>. */}
            <a href={`/auth/line?next=${encodeURIComponent(next)}`} className="line-button">
              <span className="line-button__logo" aria-hidden="true">
                <LineLogo />
              </span>
              <span className="line-button__label">เข้าสู่ระบบด้วย LINE</span>
            </a>
            <span className="note">ดูข้อมูลบนเว็บได้ทุกอย่างโดยไม่ต้องเข้าสู่ระบบ</span>
          </div>
        </main>
      </>
    )
  }

  if (sent) {
    const isReport = one(sp.kind) === 'report'
    return (
      <>
        <SiteHeader />
        <main className="done">
          <div className="done__art">
            <Icon name="check" size={56} strokeWidth={2.4} />
          </div>
          <h1>ส่งถึงทีมแล้ว ขอบคุณมาก</h1>
          <p>
            {isReport
              ? 'ทีมจะตรวจสอบและแก้ข้อมูลให้ถูกต้อง'
              : 'ทีมจะตรวจสอบข้อมูลก่อนขึ้นเว็บ ถ้าผ่านเกณฑ์ สถานที่นี้จะขึ้นในหมวดที่คุณเลือก'}
          </p>
          <div className="done__summary">
            <Photo alt="รูปที่แนบ" iconSize={24} />
            <div className="done__summary-text">
              <b>{sent}</b>
              <span>สถานะ: รอทีมตรวจ</span>
            </div>
          </div>
          <div className="done__actions">
            <Link href="/" className="btn btn--primary btn--lg btn--block">
              กลับหน้าแรก
            </Link>
            <Link href="/submit" className="btn btn--secondary btn--block">
              <Icon name="plus" size={20} strokeWidth={2.2} />
              <span>เสนออีกที่</span>
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <SiteHeader back={back} />
      <main className="submit-layout">
        <div className="submit-layout__intro">
          <h1>{kind === 'report' ? 'แจ้งข้อมูลผิด' : 'เสนอสถานที่'}</h1>
          <p className="desktop-only">ช่วยเราคัดที่ดี ๆ ให้คนเลี้ยงหมา ทีมจะตรวจทุกรายการก่อนขึ้นเว็บ</p>
          <div className="who">
            {session.picture ? (
              // eslint-disable-next-line @next/next/no-img-element -- LINE profile CDN
              <img className="who__avatar" src={session.picture} alt="" />
            ) : (
              <span className="who__avatar" aria-hidden="true" />
            )}
            <span className="who__name">
              เข้าสู่ระบบเป็น <b>{session.name}</b>
            </span>
            <form action="/auth/logout" method="post">
              <button type="submit" className="text-link">
                ออก
              </button>
            </form>
          </div>
          <Link href="/criteria" className="criteria-link desktop-only">
            อ่านเกณฑ์การคัดเลือก
          </Link>
          {isAdmin(session) && (
            <Link href="/admin" className="criteria-link">
              ไปหลังบ้าน (ตรวจข้อมูลที่ส่งมา)
            </Link>
          )}
        </div>
        <SubmitForm
          initialKind={kind}
          initialCategory={category}
          reportPlace={place ? { slug: place.slug, name: place.name } : undefined}
        />
      </main>
    </>
  )
}

function LineLogo() {
  // LINE speech-bubble mark, white on the #06C755 button.
  return (
    <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden="true">
      <path
        fill="#fff"
        d="M20 6C11.2 6 4 11.8 4 18.9c0 6.4 5.7 11.7 13.3 12.7.5.1 1.2.3 1.4.8.2.4.1 1 .1 1.4l-.2 1.4c-.1.4-.3 1.6 1.4.9 1.7-.7 9.3-5.5 12.7-9.4C35 24.1 36 21.6 36 18.9 36 11.8 28.8 6 20 6Z"
      />
      <path
        fill="#06C755"
        d="M13.4 22.6h-3.2a.4.4 0 0 1-.4-.4v-5.6c0-.2.2-.4.4-.4h.8c.2 0 .4.2.4.4v4.4h2c.2 0 .4.2.4.4v.8c0 .2-.2.4-.4.4Zm2.8-.4c0 .2-.2.4-.4.4H15a.4.4 0 0 1-.4-.4v-5.6c0-.2.2-.4.4-.4h.8c.2 0 .4.2.4.4v5.6Zm7.2 0c0 .2-.2.4-.4.4h-.8l-.1-.1-2.3-3v2.7c0 .2-.2.4-.4.4h-.8a.4.4 0 0 1-.4-.4v-5.6c0-.2.2-.4.4-.4h.9l2.2 3.1v-2.7c0-.2.2-.4.4-.4h.8c.2 0 .4.2.4.4v5.6Zm5.2-4.4c0 .2-.2.4-.4.4h-2v.8h2c.2 0 .4.2.4.4v.8c0 .2-.2.4-.4.4h-2v.8h2c.2 0 .4.2.4.4v.8c0 .2-.2.4-.4.4h-3.2a.4.4 0 0 1-.4-.4v-5.6c0-.2.2-.4.4-.4h3.2c.2 0 .4.2.4.4v.8Z"
      />
    </svg>
  )
}
