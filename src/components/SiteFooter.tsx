import Link from 'next/link'
import { categories, type Category } from '@/data/categories'
import { itemCategories } from '@/data/item-categories'
import { todayInBangkok } from '@/lib/format'
import { SITE_NAME, SOCIAL_PROFILES } from '@/lib/site'
import { LogoMark } from './Logo'

function categoryHref(c: Category) {
  return c.slug === 'farm' ? '/farm' : `/${c.slug}`
}

const aboutLinks = [
  { href: '/stories', label: 'เรื่องหมาๆ' },
  { href: '/criteria', label: 'เกณฑ์การคัดเลือก' },
  { href: '/submit', label: 'แนะนำสถานที่' },
  { href: '/credits', label: 'เครดิตภาพ' },
  { href: '/contact', label: 'ติดต่อเรา' },
]

/** Shown at the bottom of every public page (rendered from the root layout). */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link href="/" className="site-footer__logo">
            <LogoMark size={36} />
            <span>{SITE_NAME}</span>
          </Link>
          <p>รวมสถานที่ที่พาน้องหมาไปได้จริง ทีมงานคัดและเช็คเองทุกที่</p>
          <p className="site-footer__social">
            {SOCIAL_PROFILES.map((url) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            ))}
          </p>
        </div>

        <nav className="site-footer__col" aria-label="หมวดสถานที่">
          <h2>หาสถานที่</h2>
          <ul>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={categoryHref(c)}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="site-footer__col" aria-label="หมวดไอเทม">
          <h2>ไอเทม</h2>
          <ul>
            {itemCategories.map((c) => (
              <li key={c.slug}>
                <Link href={`/items/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="site-footer__col" aria-label="เกี่ยวกับ SawasdeeDog">
          <h2>SawasdeeDog</h2>
          <ul>
            {aboutLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <p>
          บางลิงก์ในเว็บเป็นลิงก์ affiliate ถ้าซื้อผ่านลิงก์ เราอาจได้ค่าคอมมิชชันเล็กน้อย
          โดยราคาที่คุณจ่ายไม่เปลี่ยน
        </p>
        <p>
          © {todayInBangkok().slice(0, 4)} {SITE_NAME} · Website by{' '}
          <a href="https://dogsanook.com" className="site-footer__credit">
            หมาสนุก
          </a>
        </p>
      </div>
    </footer>
  )
}
