import { breedPhotos } from '@/data/breed-photos.generated'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/Breadcrumb'
import { EmptyState } from '@/components/EmptyState'
import { FarmBuyerNote } from '@/components/FarmBuyerNote'
import { Icon } from '@/components/Icon'
import { ListingCard } from '@/components/ListingCard'
import { SiteHeader } from '@/components/SiteHeader'
import { breeds, breedPhoto, getBreed } from '@/data/breeds'
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
  const photo = breedPhoto(breed.slug)
  return {
    title: `ฟาร์ม${breed.name} (${breed.nameEn})`,
    description: `รวม ${farms.length} ฟาร์ม${breed.name} (${breed.nameEn}) จากทุกจังหวัด ${farmRule.banner}`,
    alternates: { canonical: `/farm/${breed.slug}` },
    robots: farms.length === 0 ? { index: false, follow: true } : undefined,
    openGraph: photo ? { images: [photo] } : undefined,
  }
}

export default async function FarmBreedPage({ params }: Props) {
  const breed = getBreed((await params).breed)
  if (!breed) notFound()
  const farms = await farmsForBreed(breed.slug)
  const photo = breedPhoto(breed.slug)
  const credit = breedPhotos[breed.slug]

  return (
    <>
      <SiteHeader back="/farm" />
      <main className="page">
        <Breadcrumb
          items={[{ label: 'หน้าแรก', href: '/' }, { label: 'ฟาร์ม', href: '/farm' }, { label: breed.name }]}
        />
        <div className="page-head">
          <div className="page-title">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- static breed photo
              <img className="page-title__photo" src={photo} alt={breed.name} />
            ) : (
              <span className="page-title__icon">
                <Icon name="farm" size={26} />
              </span>
            )}
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
            <FarmBuyerNote />
          </>
        ) : (
          <EmptyState
            compact
            title={`ยังไม่มีฟาร์ม${breed.name}ในรายการ`}
            body="รู้จักฟาร์มสายพันธุ์นี้ที่ดูแลหมาดี เสนอให้ทีมช่วยเช็คได้เลย"
            primary={{ href: '/submit?category=farm', label: 'เสนอฟาร์ม' }}
            secondary={{ href: '/farm', label: 'ดูสายพันธุ์ทั้งหมด' }}
          />
        )}
        {credit && (
          <p className="photo-credit">
            ภาพ{breed.name}: {credit.author} ·{' '}
            <a href={credit.source} target="_blank" rel="noopener noreferrer">
              {credit.license}
            </a>{' '}
            · <Link href="/credits">เครดิตภาพทั้งหมด</Link>
          </p>
        )}
      </main>
    </>
  )
}
