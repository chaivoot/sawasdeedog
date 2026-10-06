import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { SiteHeader } from '@/components/SiteHeader'
import { dogFriendly, farmRule, forceFreeDefinition, serviceRule, stayRule } from '@/data/criteria'

export const metadata: Metadata = {
  title: 'เกณฑ์การคัดเลือก',
  alternates: { canonical: '/criteria' },
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
    title: 'คาเฟ่และร้านอาหาร: ไม่มีเงื่อนไขแอบแฝง',
    body: 'หลายร้านติดป้าย Pet Friendly ตามกระแส แต่พอไปจริงกลับมีเงื่อนไข คำว่า "รับน้องหมา" ของเราต้องหมายถึงรับจริง ถ้ารับแต่ให้อยู่ได้แค่โซนนอก เข้าห้องแอร์ไม่ได้ ต้องอยู่ในรถเข็น หรือรับเฉพาะน้องตัวเล็ก แบบนี้เราไม่ลิสต์',
  },
  {
    id: 'stay',
    title: 'ที่พัก: รับน้องหมาตัวใหญ่',
    body: stayRule.body,
  },
  {
    id: 'service',
    title: 'บริการสำหรับน้องหมา: แจ้งข้อจำกัดไว้ชัด',
    body: serviceRule.body,
  },
  {
    id: 'trainer',
    title: 'ครูฝึก: Force-Free และ Balance',
    body: `เราแยกครูฝึกเป็นสองแท็บ Force-Free คือครูที่ ${forceFreeDefinition} ส่วน Balance คือครูที่ใช้การบังคับหรือแก้พฤติกรรม (correction) ร่วมด้วย แม้จะฝึกเชิงบวกเป็นหลัก แต่ถ้ายังกระตุกหรือดึงสายจูงเพื่อแก้พฤติกรรม เราจัดเป็น Balance ทีมเป็นคนจัดกลุ่มจากข้อมูลที่ครูเผยแพร่เอง`,
  },
  {
    id: 'farm',
    title: 'ฟาร์ม',
    body: `เราลิสต์ฟาร์มตามสายพันธุ์ ฟาร์มที่เราพบหลักฐานว่าออกใบเพ็ดดีกรี (Pedigree) ให้น้องได้จะมีป้าย "${farmRule.badge}" ${farmRule.scope} ก่อนซื้อควรขอดูเอง เช่น ${farmRule.buyerChecks.join(', ')}`,
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
