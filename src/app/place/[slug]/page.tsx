import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AdminEditButton } from '@/components/AdminEditButton'
import { Breadcrumb, type Crumb } from '@/components/Breadcrumb'
import { Checked } from '@/components/Checked'
import { FarmBuyerNote } from '@/components/FarmBuyerNote'
import { PedigreeBadge } from '@/components/PedigreeBadge'
import { Icon, type IconName } from '@/components/Icon'
import { PlaceGallery } from '@/components/PlaceGallery'
import { RatingWidget } from '@/components/RatingWidget'
import { RatingBadge } from '@/components/Stars'
import { SiteHeader } from '@/components/SiteHeader'
import { getCategory, trainerStyles } from '@/data/categories'
import { findArea } from '@/data/areas'
import { getBreed } from '@/data/breeds'
import { categoryRule, placeWarnings } from '@/data/criteria'
import { placeCategories, type Contacts, type Place } from '@/data/places'
import { JsonLd } from '@/components/JsonLd'
import { MIN_RATINGS_TO_SHOW } from '@/lib/limits'
import { agodaLink } from '@/lib/agoda'
import { contactLinks, splitPhones } from '@/lib/contacts'
import { serviceAreaLabels } from '@/lib/geo'
import { getPlace } from '@/lib/places'
import { DEFAULT_OG_IMAGE, absoluteUrl } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

// Rendered on first visit and cached; admin edits call revalidatePath.
export function generateStaticParams() {
  return []
}
export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const place = await getPlace((await params).slug)
  if (!place) return {}
  const category = getCategory(place.category)
  const area = findArea(place.province, place.district)
  const where = area
    ? area.district
      ? `${area.district.name} ${area.province.name}`
      : area.province.name
    : ''
  const title = `${place.name} · ${category?.name ?? ''}${where ? ` ${where}` : ''}`
  const description =
    place.description ??
    `${place.name} ${category?.name ?? ''}${where ? `ใน${where}` : ''} ที่ทีม SawasdeeDog คัดแล้ว`
  const path = `/place/${place.slug}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      images: [place.photos[0] ? { url: place.photos[0], alt: place.name } : DEFAULT_OG_IMAGE],
    },
  }
}

/** schema.org LocalBusiness (or a subtype) so search engines can show address, rating and contacts. */
function placeLd(place: Place, crumbs: Crumb[]) {
  const category = getCategory(place.category)
  const area = findArea(place.province, place.district)
  const url = absoluteUrl(`/place/${place.slug}`)
  const c = place.contacts
  const sameAs = contactLinks(c)
    .filter((l) => l.key === 'facebook' || l.key === 'instagram' || l.key === 'website')
    .map((l) => l.href)
  const business = {
    '@context': 'https://schema.org',
    '@type': category?.schemaType ?? 'LocalBusiness',
    '@id': url,
    name: place.name,
    url,
    description: place.description,
    image: place.photos.length ? place.photos.map(absoluteUrl) : undefined,
    telephone: splitPhones(c.phone)[0],
    hasMap: place.mapsUrl,
    geo:
      place.lat != null && place.lng != null
        ? { '@type': 'GeoCoordinates', latitude: place.lat, longitude: place.lng }
        : undefined,
    areaServed: place.serviceAreas?.length
      ? serviceAreaLabels(place.serviceAreas).map((name) => ({ '@type': 'AdministrativeArea', name }))
      : undefined,
    priceRange: place.price,
    // LodgingBusiness property: every stay listed here takes dogs.
    petsAllowed: place.category === 'stay' ? true : undefined,
    address: area && {
      '@type': 'PostalAddress',
      addressLocality: area.district?.name,
      addressRegion: area.province.name,
      addressCountry: 'TH',
    },
    sameAs: sameAs.length ? sameAs : undefined,
    aggregateRating:
      place.rating && place.rating.count >= MIN_RATINGS_TO_SHOW
        ? {
            '@type': 'AggregateRating',
            ratingValue: Number(place.rating.avg.toFixed(1)),
            ratingCount: place.rating.count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((cr, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: cr.label,
      item: absoluteUrl(cr.href ?? `/place/${place.slug}`),
    })),
  }
  return [business, breadcrumb]
}

// Phone opens the dialer. Facebook opens in the same tab: from a new tab, Chrome on
// mobile hands the link to the Facebook app and closes the tab, which can leave nothing open.
const sameTab = new Set<keyof Contacts>(['phone', 'facebook'])

const contactIcons: Record<keyof Contacts, IconName> = {
  phone: 'phone',
  line: 'chat',
  instagram: 'ig',
  facebook: 'fb',
  website: 'globe',
}

function criteriaFor(place: Place): string[] {
  const slugs = placeCategories(place)
  const filters = slugs.flatMap((s) => getCategory(s)?.filters ?? [])
  const items: string[] = []
  for (const s of slugs) {
    const c = categoryRule(s)?.criterion
    if (c && !items.includes(c)) items.push(c)
  }
  if (place.trainerStyle) {
    const style = trainerStyles.find((s) => s.slug === place.trainerStyle)
    if (style) items.push(`แนวการฝึก ${style.label}`)
  }
  // A stay with no weight limit says so; one with a limit gets a warning instead.
  if (slugs.includes('stay') && !place.maxDogKg) items.push('ไม่จำกัดน้ำหนักน้องหมา')
  for (const a of place.attributes) {
    const label = filters.find((f) => f.slug === a)?.label
    if (label) items.push(label)
  }
  return items
}

export default async function PlacePage({ params }: Props) {
  const place = await getPlace((await params).slug)
  if (!place) notFound()

  const category = getCategory(place.category)
  const area = findArea(place.province, place.district)
  const typeLabel = category?.types?.find((t) => t.slug === place.type)?.label
  const extraNames = (place.extraCategories ?? []).map((s) => getCategory(s)?.name).filter(Boolean)
  const breedNames = (place.breeds ?? []).map((b) => getBreed(b)?.name).filter(Boolean)
  const criteria = criteriaFor(place)
  const warnings = placeWarnings(
    place,
    placeCategories(place).flatMap((s) => getCategory(s)?.warnings ?? []),
  )
  const contacts = contactLinks(place.contacts)
  const serviceAreas = serviceAreaLabels(place.serviceAreas ?? [])

  const isFarm = place.category === 'farm'
  const isStay = placeCategories(place).includes('stay')
  // A stay that only takes dogs on direct bookings gets no booking-site button.
  const agoda =
    place.agodaUrl && isStay && !place.attributes.includes('direct-booking-only')
      ? agodaLink(place.agodaUrl)
      : undefined
  const petFee = isStay ? place.petFee : undefined
  const listHref = isFarm
    ? place.breeds?.[0]
      ? `/farm/${place.breeds[0]}`
      : '/farm'
    : `/${place.category}${area ? `/${area.province.slug}${area.district ? `/${area.district.slug}` : ''}` : ''}`

  const crumbs: Crumb[] = [{ label: 'หน้าแรก', href: '/' }]
  if (category) crumbs.push({ label: category.name, href: isFarm ? '/farm' : `/${category.slug}` })
  if (!isFarm && area) {
    crumbs.push({ label: area.province.name, href: `/${place.category}/${area.province.slug}` })
    if (area.district) {
      crumbs.push({
        label: area.district.name,
        href: `/${place.category}/${area.province.slug}/${area.district.slug}`,
      })
    }
  }
  crumbs.push({ label: place.name })

  return (
    <>
      <JsonLd data={placeLd(place, crumbs)} />
      <SiteHeader desktopOnly />
      <AdminEditButton href={place.id ? `/admin/places/${place.id}` : '/admin/places'} />
      <main className="page page--place">
        <Breadcrumb items={crumbs} />
        <PlaceGallery photos={place.photos} name={place.name} back={listHref} />
        <div className="place">
          <div className="place__main">
            <div className="place__head">
              <span className="place__eyebrow">
                {category?.name}
                {typeLabel && ` · ${typeLabel}`}
                {extraNames.map((n) => ` · ${n}`)}
              </span>
              <h1>{place.name}</h1>
              {isFarm && <PedigreeBadge attributes={place.attributes} large />}
              {area && (
                <span className="place__area">
                  <Icon name="pin" size={18} strokeWidth={2} />
                  {isFarm ? `จ.${area.province.name}` : area.province.name}
                  {area.district && ` › ${area.district.name}`}
                </span>
              )}
              <RatingBadge rating={place.rating} />
              <Checked date={place.checkedAt} long className="place__checked mobile-only" />
            </div>

            {place.description && <p className="place__description">{place.description}</p>}

            {criteria.length > 0 && (
              <section className="place__section place__criteria">
                <h2>ผ่านเกณฑ์อะไรบ้าง</h2>
                <ul className="criteria-list">
                  {criteria.map((c) => (
                    <li key={c}>
                      <Icon name="check" size={20} strokeWidth={2.4} />
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {warnings.length > 0 && (
              <section className="place__section place__criteria place__warnings">
                <h2>ข้อจำกัดที่ควรรู้</h2>
                <ul className="criteria-list criteria-list--warn">
                  {warnings.map((w) => (
                    <li key={w}>
                      <Icon name="flag" size={20} strokeWidth={2.2} />
                      {w}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {breedNames.length > 0 && (
              <section className="place__section place__criteria">
                <h2>สายพันธุ์</h2>
                <div className="tag-list">
                  {breedNames.map((b) => (
                    <span key={b} className="tag">
                      {b}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {isFarm && <FarmBuyerNote className="place__section place__buyer-note" />}

            <RatingWidget slug={place.slug} initial={place.rating} />

            <Link href={`/submit?type=report&place=${place.slug}`} className="report-link place__report">
              <Icon name="flag" size={18} strokeWidth={2} />
              ข้อมูลไม่ตรง? แจ้งข้อมูลผิด
            </Link>
          </div>

          <aside className="place__aside">
            {place.mapsUrl && (
              <a
                href={place.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn--navigate place__navigate ${place.category === 'stay' ? 'btn--navigate-outline' : 'btn--primary'}`}
                data-track="navigate_click"
                data-place={place.slug}
                data-category={place.category}
              >
                <Icon name="nav" size={24} strokeWidth={2} />
                <span>นำทางด้วย Google Maps</span>
              </a>
            )}
            {agoda && (
              <div className="place__booking place__navigate">
                <a
                  href={agoda}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="btn btn--primary btn--navigate"
                  data-track="agoda_click"
                  data-place={place.slug}
                >
                  <Icon name="tag" size={24} strokeWidth={2} />
                  <span>เช็คราคาห้องพัก (Agoda)</span>
                </a>
                <p className="place__booking-note">
                  จองแล้วแจ้งที่พักว่าพาน้องหมาไปด้วย และเลือกห้องที่รับน้องหมา
                </p>
                <p className="place__booking-note">
                  ลิงก์พันธมิตร เราอาจได้ค่าตอบแทนเมื่อคุณจอง ไม่มีผลต่อราคาและการคัดเลือก
                </p>
              </div>
            )}
            {serviceAreas.length > 0 && (
              <div className="service-areas place__navigate">
                <span className="service-areas__label">
                  <Icon name="pin" size={18} strokeWidth={2} />
                  ให้บริการถึงที่
                </span>
                <span className="service-areas__list">{serviceAreas.join(' · ')}</span>
              </div>
            )}
            <Checked date={place.checkedAt} long className="place__checked desktop-only" />

            {(place.hours || place.price || petFee) && (
              <div className="place__aside-section place__info">
                <div className="info-box">
                  {place.hours && (
                    <div className="info-row">
                      <Icon name="clock" size={22} strokeWidth={1.9} />
                      <div className="info-row__text">
                        <span className="info-row__label">เวลาเปิด</span>
                        <span className="info-row__value">{place.hours}</span>
                      </div>
                    </div>
                  )}
                  {place.price && (
                    <div className="info-row">
                      <Icon name="tag" size={22} strokeWidth={1.9} />
                      <div className="info-row__text">
                        <span className="info-row__label">ราคา</span>
                        <span className="info-row__value">{place.price}</span>
                      </div>
                    </div>
                  )}
                  {petFee && (
                    <div className="info-row">
                      <Icon name="stay" size={22} strokeWidth={1.9} />
                      <div className="info-row__text">
                        <span className="info-row__label">ค่าน้องหมา</span>
                        <span className="info-row__value">{petFee}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {contacts.length > 0 && (
              <section className="place__aside-section place__contacts">
                <h2>ติดต่อ</h2>
                <div className="contact-list">
                  {contacts.map((c, i) => (
                    <a
                      key={`${c.key}-${i}`}
                      href={c.href}
                      className="contact"
                      data-track="contact_click"
                      data-channel={c.key}
                      data-place={place.slug}
                      data-category={place.category}
                      {...(sameTab.has(c.key) ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                    >
                      <span className="contact__icon">
                        <Icon name={contactIcons[c.key]} size={20} strokeWidth={1.9} />
                      </span>
                      <span className="contact__text">
                        <span className="contact__label">{c.label}</span>
                        <span className="contact__value">{c.value}</span>
                      </span>
                      <Icon name="right" size={18} strokeWidth={2} />
                    </a>
                  ))}
                </div>
                <span className="small-note">แสดงเฉพาะช่องทางที่ร้านมี</span>
              </section>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}
