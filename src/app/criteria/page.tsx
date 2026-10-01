import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'เกณฑ์การคัดเลือก',
  description: 'คัดมาแล้ว ไม่ใช่มีครบ วิธีที่ทีม SawasDeeDog คัดสถานที่ และนิยาม force-free ของเรา',
}

const rules = [
  {
    id: 'team',
    title: 'ทีมเก็บและคัดเองทุกรายการ',
    body: 'ข้อมูลทุกรายการมาจากทีมครูฝึกสาย R+ ที่ไปดูหรือเช็คเอง ไม่ได้ดึงมาจากรีวิวออนไลน์ และทุกรายการบอกวันที่เช็คล่าสุดไว้',
  },
  {
    id: 'cafe',
    title: 'คาเฟ่ & ร้านอาหาร',
    body: 'ทุกร้านในหมวดนี้ต้องให้หมาเข้าห้องแอร์ได้ ถ้าไม่ผ่านข้อนี้ เราไม่ลิสต์',
  },
  {
    id: 'trainer',
    title: 'ครูฝึก: R+ และ Balance',
    body: 'เราแยกครูฝึกเป็นสองแท็บ R+ คือครูที่ทำงานตามนิยาม force-free ข้างบน Balance คือครูที่ใช้การแก้พฤติกรรมร่วมด้วย ทีมเป็นคนจัดกลุ่มจากข้อมูลที่ครูเผยแพร่เอง',
  },
  {
    id: 'sponsor',
    title: 'นโยบายสปอนเซอร์',
    body: 'พื้นที่สปอนเซอร์ติดป้าย สปอนเซอร์ ไว้ทุกครั้ง และผู้สนับสนุนต้องสอดคล้องกับแนว force-free',
  },
  {
    id: 'farm',
    title: 'ฟาร์ม',
    // TODO(build-spec 4.2): farm acceptance criteria are still being decided.
    body: '[เกณฑ์รับฟาร์มเข้า ทีมกำลังสรุป]',
  },
  {
    id: 'report',
    title: 'เจอข้อมูลไม่ตรง',
    body: 'ทุกหน้ามีปุ่ม แจ้งข้อมูลผิด ทีมจะตรวจและแก้ให้',
  },
]

export default function CriteriaPage() {
  return (
    <>
      <SiteHeader back="/" />
      <main className="prose-page">
        <div className="prose-page__intro">
          <span className="eyebrow">เกณฑ์การคัดเลือก</span>
          <h1>คัดมาแล้ว ไม่ใช่มีครบ</h1>
          <p>เราอยากให้ทุกที่ที่ลิสต์ไว้ เป็นที่ที่คุณพาหมาไปได้อย่างสบายใจ นี่คือวิธีที่เราคัด</p>
        </div>

        <figure className="definition" id="force-free">
          <figcaption>นิยาม force-free ของเรา</figcaption>
          <blockquote>
            ไม่ใช้ความเจ็บ ความอึดอัด หรือความกลัว เพื่อหยุดพฤติกรรม หรือเพื่อบังคับให้หมาทำตาม
            ไม่ว่าจะผ่านอุปกรณ์ มือ เสียง หรือวิธีอื่นใด
          </blockquote>
        </figure>

        <div className="rule-grid">
          {rules.map((r, i) => (
            <section key={r.id} id={r.id} className="rule">
              <div className="rule__head">
                <span className="rule__num" aria-hidden="true">
                  {i + 1}
                </span>
                <h2>{r.title}</h2>
              </div>
              <p>{r.body}</p>
            </section>
          ))}
        </div>

        <Link href="/submit" className="btn btn--secondary btn--block">
          <Icon name="plus" size={20} strokeWidth={2.2} />
          <span>รู้จักที่ที่ผ่านเกณฑ์? เสนอสถานที่</span>
        </Link>
      </main>
    </>
  )
}
