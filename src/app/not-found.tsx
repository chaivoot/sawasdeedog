import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'

export default function NotFound() {
  return (
    <>
      <SiteHeader back="/" />
      <main className="not-found">
        <h1>ไม่พบหน้านี้</h1>
        <p>ลิงก์อาจเปลี่ยนไป หรือรายการนี้ถูกนำออกแล้ว</p>
        <Link href="/" className="btn btn--primary">
          กลับหน้าแรก
        </Link>
      </main>
    </>
  )
}
