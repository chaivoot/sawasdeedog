import type { Metadata } from 'next'
import Link from 'next/link'
import { Brand } from '@/components/Logo'
import { isAdmin } from '@/lib/admin'
import { getSession } from '@/lib/session'
import { isSupabaseConfigured } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'หลังบ้าน',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    return (
      <main className="admin-gate">
        <Brand size="large" />
        <h1>หลังบ้านทีม SawasdeeDog</h1>
        <p>เข้าสู่ระบบด้วย LINE บัญชีที่ทีมเพิ่มไว้</p>
        {/* Route handler redirect, so a plain <a> rather than <Link>. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/auth/line?next=/admin" className="btn btn--primary">
          เข้าสู่ระบบด้วย LINE
        </a>
      </main>
    )
  }

  if (!isAdmin(session)) {
    return (
      <main className="admin-gate">
        <Brand size="large" />
        <h1>บัญชีนี้ยังไม่มีสิทธิ์เข้าหลังบ้าน</h1>
        <p>
          ส่ง LINE user ID ด้านล่างให้ผู้ดูแล เพื่อเพิ่มใน <code>ADMIN_LINE_USER_IDS</code>
        </p>
        <code className="admin-gate__id">{session.sub}</code>
        <form action="/auth/logout" method="post">
          <button type="submit" className="btn btn--secondary">
            ออกจากระบบ
          </button>
        </form>
      </main>
    )
  }

  return (
    <>
      <header className="admin-header">
        <div className="admin-header__inner">
          <Brand size="small" />
          <nav className="admin-nav" aria-label="หลังบ้าน">
            <Link href="/admin">ข้อมูลที่ส่งมา</Link>
            <Link href="/admin/places">รายการบนเว็บ</Link>
            <Link href="/admin/places/new">+ เพิ่มรายการ</Link>
          </nav>
          <span className="admin-header__who">{session.name}</span>
        </div>
      </header>
      {!isSupabaseConfigured() && (
        <p className="admin-warning">
          ยังไม่ได้ตั้งค่า Supabase ตอนนี้เป็นข้อมูลตัวอย่าง บันทึกไม่ได้ (ดูขั้นตอนใน README)
        </p>
      )}
      <main className="admin-main">{children}</main>
    </>
  )
}
