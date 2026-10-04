import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/Breadcrumb'
import { BreedSearch } from '@/components/BreedSearch'
import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { farmRule } from '@/data/criteria'
import { FarmBuyerNote } from '@/components/FarmBuyerNote'
import { SiteHeader } from '@/components/SiteHeader'
import { breedsWithFarms } from '@/lib/places'

export const metadata: Metadata = {
  title: 'ฟาร์มสุนัข เลือกตามสายพันธุ์',
  alternates: { canonical: '/farm' },
  description: `เลือกสายพันธุ์ แล้วดูฟาร์มจากทุกจังหวัด ฟาร์มที่ออกใบเพ็ดดีกรีได้มีป้ายบอกชัด`,
}

export const revalidate = 3600

export default async function FarmPage() {
  return (
    <>
      <SiteHeader back="/" />
      <main className="page farm-page">
        <Breadcrumb items={[{ label: 'หน้าแรก', href: '/' }, { label: 'ฟาร์ม' }]} />
        <BreedSearch
          breeds={await breedsWithFarms()}
          intro={
            <div className="farm-intro">
              <div className="page-title">
                <span className="page-title__icon">
                  <Icon name="farm" size={26} />
                </span>
                <h1>ฟาร์ม</h1>
              </div>
              <p className="lead">เลือกสายพันธุ์ แล้วดูฟาร์มจากทุกจังหวัด</p>
              <Link href="/criteria#farm" className="guarantee">
                <Icon name="award" size={18} strokeWidth={2} />
                {farmRule.banner}
              </Link>
              <FarmBuyerNote />
            </div>
          }
        />
        <p className="photo-credit">
          ภาพสายพันธุ์จาก Wikimedia Commons · <Link href="/credits">เครดิตภาพ</Link>
        </p>
      </main>
    </>
  )
}
