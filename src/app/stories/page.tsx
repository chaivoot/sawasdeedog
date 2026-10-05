import type { Metadata } from 'next'
import { EmptyState } from '@/components/EmptyState'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'เรื่องหมาๆ',
  alternates: { canonical: '/stories' },
  // No articles yet: keep it out of search until there is something to read.
  robots: { index: false, follow: true },
}

/** Articles about life with dogs. Empty for now; the header links here ahead of the first one. */
export default function StoriesPage() {
  return (
    <>
      <SiteHeader back="/" />
      <main className="prose-page">
        <div className="prose-page__intro">
          <span className="eyebrow">บทความ</span>
          <h1>เรื่องหมาๆ</h1>
          <p>เรื่องเล่า ทริป และเคล็ดลับการใช้ชีวิตกับน้องหมา จากทีม SawasdeeDog</p>
        </div>
        <EmptyState
          compact
          title="บทความแรกกำลังมา"
          body="ระหว่างนี้ อ่านได้ว่าเราคัดสถานที่ยังไง"
          primary={{ href: '/criteria', label: 'อ่านเกณฑ์การคัดเลือก' }}
          secondary={{ href: '/', label: 'กลับหน้าแรก' }}
        />
      </main>
    </>
  )
}
