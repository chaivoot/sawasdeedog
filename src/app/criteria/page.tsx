import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { SiteHeader } from '@/components/SiteHeader'
import { dogFriendly, forceFreeDefinition } from '@/data/criteria'

export const metadata: Metadata = {
  title: 'เกณฑ์การคัดเลือก',
  description: `คัดมาแล้ว ไม่ใช่มีครบ เราลิสต์เฉพาะที่ที่เป็น ${dogFriendly.name} ไม่มีเงื่อนไขแอบแฝง`,
}

const rules = [
  {
    id: 'team',
    title: 'ทีมเก็บและคัดเองทุกรายการ',
    body: 'ข้อมูลทุกรายการมาจากทีม SawasdeeDog ที่ไปดูหรือเช็คเอง ไม่ได้ดึงมาจากรีวิวออนไลน์ และทุกรายการบอกวันที่เช็คล่าสุดไว้',
  },
  {
    id: 'no-conditions',
    title: 'ไม่มีเงื่อนไขแอบแฝง',
    body: 'คำว่า "รับน้องหมา" ต้องหมายถึงรับจริง ถ้ารับแต่ให้อยู่ได้แค่โซนนอก เข้าห้องแอร์ไม่ได้ หรือรับเข้าห้องพักแต่จำกัดเฉพาะน้องที่หนักไม่เกิน 4 กิโลกรัม แบบนี้เราไม่ลิสต์ ใช้เกณฑ์เดียวกันทุกหมวด ทั้งคาเฟ่ ที่พัก ร้านอาบน้ำ ฝากเลี้ยง และอื่น ๆ',
  },
  {
    id: 'house-rules',
    title: 'กติกาที่ใช้กับน้องทุกตัวเท่ากัน ไม่นับเป็นเงื่อนไข',
    body: 'เช่น ให้ใส่สายจูง มีสมุดวัคซีน หรือเจ้าของต้องดูแลน้องตลอดเวลา เป็นมารยาทพื้นฐานที่ใช้กับทุกตัวเท่ากัน ไม่ถือว่าเป็นเงื่อนไขแอบแฝง',
  },
  {
    id: 'trainer',
    title: 'ครูฝึก: Force-Free และ Balance',
    body: `เราแยกครูฝึกเป็นสองแท็บ Force-Free คือครูที่ ${forceFreeDefinition} ส่วน Balance คือครูที่ใช้การบังคับหรือแก้พฤติกรรม (correction) ร่วมด้วย ทีมเป็นคนจัดกลุ่มจากข้อมูลที่ครูเผยแพร่เอง`,
  },
  {
    id: 'farm',
    title: 'ฟาร์ม',
    body: 'เราลิสต์เฉพาะฟาร์มที่ออกใบเพ็ดดีกรี (Pedigree) หรือใบรับรองสายพันธุ์ให้น้องได้',
  },
  {
    id: 'sponsor',
    title: 'นโยบายสปอนเซอร์',
    body: 'พื้นที่สปอนเซอร์ติดป้าย สปอนเซอร์ ไว้ทุกครั้ง และผู้สนับสนุนต้องผ่านเกณฑ์ของหมวดนั้น ๆ เหมือนทุกรายการบนเว็บ',
  },
  {
    id: 'report',
    title: 'เจอข้อมูลไม่ตรง',
    body: 'ถ้าที่ไหนเริ่มมีเงื่อนไขกับน้องหมา หรือข้อมูลเปลี่ยนไป กดปุ่ม แจ้งข้อมูลผิด ที่หน้านั้นได้เลย ทีมจะตรวจและแก้ให้',
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

        <figure className="definition" id="dog-friendly">
          <figcaption>นิยาม {dogFriendly.name} ของเรา</figcaption>
          <blockquote>{dogFriendly.definition}</blockquote>
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
