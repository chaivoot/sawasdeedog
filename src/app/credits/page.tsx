import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { breedPhotos } from '@/data/breed-photos.generated'
import { breeds } from '@/data/breeds'

export const metadata: Metadata = {
  title: 'เครดิตภาพ',
  alternates: { canonical: '/credits' },
  robots: { index: false, follow: true },
}

/** Who took the breed photos, and under which licence (from Wikimedia Commons). */
export default function CreditsPage() {
  const credited = breeds.filter((b) => breedPhotos[b.slug])
  return (
    <>
      <SiteHeader back="/farm" />
      <main className="prose-page">
        <div className="prose-page__intro">
          <h1>เครดิตภาพ</h1>
          <p>
            ภาพสายพันธุ์หมาในหน้าฟาร์มมาจาก Wikimedia Commons ใช้ตามสัญญาอนุญาตของแต่ละภาพ
            กดชื่อสัญญาอนุญาตเพื่อดูภาพต้นฉบับ
          </p>
        </div>
        <ul className="credit-list">
          {credited.map((b) => {
            const c = breedPhotos[b.slug]
            return (
              <li key={b.slug}>
                <b>{b.name}</b> — {c.author} ·{' '}
                <a href={c.source} target="_blank" rel="noopener noreferrer">
                  {c.license}
                </a>
              </li>
            )
          })}
        </ul>
      </main>
    </>
  )
}
