import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/Breadcrumb'
import { EmptyState } from '@/components/EmptyState'
import { Icon } from '@/components/Icon'
import { ListingCard } from '@/components/ListingCard'
import { SiteHeader } from '@/components/SiteHeader'
import { breeds, getBreed } from '@/data/breeds'
import { farmRule } from '@/data/criteria'
import { farmsForBreed } from '@/lib/places'

type Props = { params: Promise<{ breed: string }> }

export const revalidate = 3600

export function generateStaticParams() {
  return breeds.map((b) => ({ breed: b.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const breed = getBreed((await params).breed)
  if (!breed) return {}
  const farms = await farmsForBreed(breed.slug)
  return {
    title: `ฟาร์ม${breed.name} (${breed.nameEn}) ออกใบเพ็ดดีกรีได้`,
    description: `รวม ${farms.length} ฟาร์ม${breed.name} (${breed.nameEn}) ที่ผ่านเกณฑ์จากทุกจังหวัด ${farmRule.banner}`,
    alternates: { canonical: `/farm/${breed.slug}` },
    robots: farms.length === 0 ? { index: false, follow: true } : undefined,
  }
}

export default async function FarmBreedPage({ params }: Props) {
  const breed = getBreed((await params).breed)
  if (!breed) notFound()
  const farms = await farmsForBreed(breed.slug)

  return (
    <>
      <SiteHeader back="/farm" />
      <main className="page">
        <Breadcrumb
          items={[{ label: 'หน้าแรก', href: '/' }, { label: 'ฟาร์ม', href: '/farm' }, { label: breed.name }]}
        />
        <div className="page-head">
          <div className="page-title">
            <span className="page-title__icon">
              <Icon name="farm" size={26} />
            </span>
            <div className="page-title__text">
              <span className="page-title__eyebrow">ฟาร์ม</span>
              <h1>{breed.name}</h1>
              <span className="page-title__sub">{breed.nameEn}</span>
            </div>
          </div>
          <Link href="/farm" className="btn btn--secondary">
            <Icon name="search" size={18} strokeWidth={2} />
            <span>เปลี่ยนสายพันธุ์</span>
          </Link>
        </div>
        {farms.length > 0 ? (
          <>
            <span className="result-count">{farms.length} ฟาร์ม จากทุกจังหวัด</span>
            <div className="listing-list">
              {farms.map((p) => (
                <ListingCard key={p.slug} place={p} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            compact
            title={`ยังไม่มีฟาร์ม${breed.name}ที่ผ่านเกณฑ์`}
            body="รู้จักฟาร์มสายพันธุ์นี้ที่ดูแลหมาดี เสนอให้ทีมช่วยเช็คได้เลย"
            primary={{ href: '/submit?category=farm', label: 'เสนอฟาร์ม' }}
            secondary={{ href: '/farm', label: 'ดูสายพันธุ์ทั้งหมด' }}
          />
        )}
      </main>
    </>
  )
}
