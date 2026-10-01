import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/Breadcrumb'
import { BreedSearch } from '@/components/BreedSearch'
import { Icon } from '@/components/Icon'
import { SiteHeader } from '@/components/SiteHeader'
import { breedsWithFarms } from '@/lib/places'

export const metadata: Metadata = {
  title: 'ฟาร์ม',
  description: 'เลือกสายพันธุ์ แล้วดูฟาร์มที่ผ่านเกณฑ์จากทุกจังหวัด',
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
              <p className="lead">เลือกสายพันธุ์ แล้วดูฟาร์มที่ผ่านเกณฑ์จากทุกจังหวัด</p>
            </div>
          }
        />
      </main>
    </>
  )
}
