import type { Metadata } from 'next'
import Link from 'next/link'
import { CallButton } from '@/components/CallButton'
import { Icon, type IconName } from '@/components/Icon'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'ติดต่อทีมงาน',
  alternates: { canonical: '/contact' },
  description: 'เสนอสถานที่ แจ้งข้อมูลผิด เจ้าของร้านอยากแก้ข้อมูล หรือติดต่อเรื่องอื่นกับทีม SawasdeeDog',
}

type Topic = {
  id: string
  icon: IconName
  title: string
  body: string
  /** A page that handles this without a call. */
  link?: { href: string; label: string }
  /** Worth a call: things the forms do not cover. */
  call?: boolean
}

const topics: Topic[] = [
  {
    id: 'suggest',
    icon: 'plus',
    title: 'เสนอสถานที่ใหม่',
    body: 'รู้จักร้าน ที่พัก หรือบริการที่ผ่านเกณฑ์ ส่งมาได้เลย ทีมจะไปเช็คก่อนขึ้นเว็บทุกรายการ',
    link: { href: '/submit', label: 'เสนอสถานที่' },
  },
  {
    id: 'report',
    icon: 'flag',
    title: 'แจ้งข้อมูลผิด หรือที่ไหนเริ่มมีเงื่อนไข',
    body: 'เวลาเปิด เบอร์โทร ย้ายร้าน ปิดกิจการ หรือเริ่มไม่รับน้องหมาตัวใหญ่ กดปุ่ม "แจ้งข้อมูลผิด" ที่หน้าของที่นั้นได้เลย ทีมจะตรวจและแก้ให้',
  },
  {
    id: 'owner',
    icon: 'edit',
    title: 'เจ้าของร้าน / เจ้าของกิจการ',
    body: 'อยากอัปเดตข้อมูล เปลี่ยนรูป แจ้งกฎใหม่เรื่องน้องหมา หรือขอให้นำรายการออก โทรหาทีมได้ การลิสต์บนเว็บไม่มีค่าใช้จ่าย และจ่ายเงินเพื่อให้ได้ลิสต์ไม่ได้',
    call: true,
  },
  {
    id: 'partner',
    icon: 'chat',
    title: 'สปอนเซอร์ ความร่วมมือ และสื่อ',
    body: 'สนใจเป็นสปอนเซอร์หมวด ชวนทำกิจกรรมกับน้องหมา สัมภาษณ์ หรือทำงานร่วมกัน โทรคุยกับทีมได้ สปอนเซอร์ไม่ได้ช่วยให้ผ่านเกณฑ์ ทุกที่ยังต้องผ่านการคัดเหมือนกัน',
    call: true,
  },
  {
    id: 'site',
    icon: 'globe',
    title: 'เว็บใช้งานไม่ได้',
    body: 'เข้าสู่ระบบไม่ได้ หน้าไหนเปิดไม่ขึ้น หรือส่งข้อมูลไม่ผ่าน บอกเราว่าเกิดที่หน้าไหน ใช้มือถือหรือคอม',
    call: true,
  },
]

export default function ContactPage() {
  return (
    <>
      <SiteHeader back="/" />
      <main className="prose-page">
        <div className="prose-page__intro">
          <span className="eyebrow">ติดต่อทีมงาน</span>
          <h1>มีเรื่องอะไร บอกเราได้</h1>
          <p>เลือกเรื่องที่ต้องการติดต่อ บางเรื่องส่งผ่านเว็บได้เลยไม่ต้องโทร</p>
        </div>

        <div className="rule-grid">
          {topics.map((t) => (
            <section key={t.id} id={t.id} className="rule contact-topic">
              <div className="rule__head">
                <span className="contact-topic__icon" aria-hidden="true">
                  <Icon name={t.icon} size={18} strokeWidth={2} />
                </span>
                <h2>{t.title}</h2>
              </div>
              <p>{t.body}</p>
              {t.link && (
                <Link href={t.link.href} className="btn btn--secondary btn--sm contact-topic__action">
                  {t.link.label}
                  <Icon name="right" size={16} strokeWidth={2.2} />
                </Link>
              )}
            </section>
          ))}
        </div>

        <section className="contact-call" aria-labelledby="contact-call">
          <h2 id="contact-call">โทรหาทีมงาน</h2>
          <p>สำหรับเจ้าของร้าน สปอนเซอร์ ความร่วมมือ และปัญหาการใช้งานเว็บ</p>
          <CallButton />
          <p className="contact-call__hint">กดจากมือถือเพื่อโทรออก</p>
        </section>

        <section className="rule contact-topic contact-topic--vet">
          <div className="rule__head">
            <span className="contact-topic__icon" aria-hidden="true">
              <Icon name="vet" size={18} strokeWidth={2} />
            </span>
            <h2>น้องหมาป่วย หรือมีอาการผิดปกติ</h2>
          </div>
          <p>
            ทีมงานไม่ใช่สัตวแพทย์ และตอบเรื่องอาการทางโทรศัพท์ไม่ได้ ถ้าน้องไม่สบาย พาไปหาหมอดีที่สุด
            ดูโรงพยาบาลสัตว์ใกล้คุณ หรือที่เปิด 24 ชม. ได้ที่นี่
          </p>
          <Link href="/vet" className="btn btn--secondary btn--sm contact-topic__action">
            หาโรงพยาบาลสัตว์
            <Icon name="right" size={16} strokeWidth={2.2} />
          </Link>
        </section>
      </main>
    </>
  )
}
