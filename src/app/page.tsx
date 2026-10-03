import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { AreaPicker } from '@/components/AreaPicker'
import { Icon } from '@/components/Icon'
import { SiteHeader } from '@/components/SiteHeader'
import { categories, featuredCategories, type Category } from '@/data/categories'
import { AREA_COOKIE, NEAR_ME, areaPath, parseAreaCookie, type Area } from '@/data/areas'
import { activeSponsor, listIndexEntries } from '@/lib/places'
import { todayInBangkok } from '@/lib/format'
import type { Sponsor } from '@/data/sponsors'
import { JsonLd } from '@/components/JsonLd'
import { SITE_DESCRIPTION, SITE_NAME, SOCIAL_PROFILES, absoluteUrl, siteUrl } from '@/lib/site'

export const metadata: Metadata = { alternates: { canonical: '/' } }

const siteLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    // So Google shows "SawasdeeDog" as the site name rather than the bare domain.
    alternateName: ['Sawasdee Dog', 'สวัสดีด็อก'],
    url: siteUrl(),
    description: SITE_DESCRIPTION,
    inLanguage: 'th-TH',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: siteUrl(),
    logo: absoluteUrl('/logo-full.jpg'),
    sameAs: SOCIAL_PROFILES,
  },
]

function categoryHref(c: Category, area?: Area, near?: boolean) {
  if (c.slug === 'farm') return '/farm'
  // Stays are picked by trip destination, not where you are: open on every province.
  if (c.slug === 'stay') return '/stay'
  return near ? `/${c.slug}?near=1` : `/${c.slug}${areaPath(area)}`
}

/** "วันนี้ชวนไป" rotates daily through the featured categories. */
function dailyPick(today: string): Category {
  const day = Math.floor(Date.parse(`${today}T00:00:00Z`) / 86_400_000)
  return featuredCategories[day % featuredCategories.length]
}

export default async function HomePage() {
  const areaCookie = (await cookies()).get(AREA_COOKIE)?.value
  const near = areaCookie === NEAR_ME
  const area = parseAreaCookie(areaCookie)
  const today = todayInBangkok()
  const sponsor = activeSponsor(today)
  // Listings per category, countrywide (a place counts under each category it is listed in).
  const counts = new Map<string, number>()
  for (const e of await listIndexEntries())
    for (const c of e.categories) counts.set(c, (counts.get(c) ?? 0) + 1)
  const featured = sponsor
    ? (categories.find((c) => c.slug === sponsor.category) ?? dailyPick(today))
    : dailyPick(today)
  // Layout 2,3,3,3: featured (span 2) + one tall tile, then three rows of three.
  const rest = categories.filter((c) => c.slug !== featured.slug)

  return (
    <>
      <JsonLd data={siteLd} />
      <SiteHeader />
      <main className="page page--home">
        <div className="home-intro">
          <div className="home-intro__text">
            <h1>หา Pet Friendly ที่จริงใจ ให้หมาคุณ</h1>
            <p>ค้นหาบริการต่างๆ ที่เราคัดมาแล้ว ให้กับน้องหมาของคุณเลย</p>
          </div>
          {/* Picker labels ("เลือกย่าน", province names) are not a summary of the page. */}
          <div className="home-intro__area" data-nosnippet>
            <AreaPicker province={area?.province.slug} district={area?.district?.slug} near={near} />
          </div>
        </div>

        <div className="home-grid">
          <FeaturedTile
            category={featured}
            href={categoryHref(featured, area, near)}
            sponsor={sponsor}
            count={counts.get(featured.slug) ?? 0}
          />
          {rest.map((c, i) => (
            <CategoryTile
              key={c.slug}
              category={c}
              href={categoryHref(c, area, near)}
              tall={i === 0}
              count={counts.get(c.slug) ?? 0}
            />
          ))}
        </div>

        <Link href="/criteria" className="callout">
          <Icon name="shield" size={22} strokeWidth={1.9} />
          <span className="callout__text">
            <b className="mobile-only">คัดมาแล้ว ไม่ใช่มีครบ</b>
            <b className="desktop-only">เราคัดยังไง</b>
            <br />
            <span className="mobile-only">อ่านเกณฑ์การคัดเลือกของเรา</span>
            <span className="desktop-only">อ่านเกณฑ์การคัดเลือก และนิยาม Dog Friendly ของเรา</span>
          </span>
          <Icon name="right" size={20} strokeWidth={2} />
        </Link>

        <Link href="/contact" className="callout callout--quiet">
          <Icon name="chat" size={22} strokeWidth={1.9} />
          <span className="callout__text">
            <b>ติดต่อทีมงาน</b>
            <br />
            <span>เจ้าของร้าน สปอนเซอร์ หรือเรื่องอื่น ๆ</span>
          </span>
          <Icon name="right" size={20} strokeWidth={2} />
        </Link>
      </main>
    </>
  )
}

function FeaturedTile({
  category,
  href,
  sponsor,
  count,
}: {
  category: Category
  href: string
  sponsor?: Sponsor
  count: number
}) {
  return (
    <Link href={href} className="featured">
      <div className="featured__content">
        <div className="featured__top">
          {sponsor ? (
            <span className="sponsor-label">สปอนเซอร์</span>
          ) : (
            <span className="featured__eyebrow">วันนี้ชวนไป</span>
          )}
          <span className="featured__badge">
            <Icon name={category.icon} size={22} />
          </span>
        </div>
        <div className="featured__body">
          <span className="featured__name">{category.name}</span>
          <span className="featured__count">{count} รายการ</span>
          <span className="featured__tagline">{category.tagline ?? category.description}</span>
        </div>
        {sponsor ? (
          <div className="featured__sponsor">
            <div className="featured__sponsor-logo" role="img" aria-label={`โลโก้ ${sponsor.name}`}>
              {sponsor.logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- sponsor logos are arbitrary external files
                <img src={sponsor.logo} alt="" />
              ) : (
                'โลโก้'
              )}
            </div>
            <span className="featured__sponsor-name">{sponsor.name}</span>
          </div>
        ) : (
          <span className="featured__more">
            ดูรายการ
            <Icon name="right" size={16} strokeWidth={2.2} />
          </span>
        )}
      </div>
      <span className="featured__badge featured__badge--large">
        <Icon name={category.icon} size={60} />
      </span>
    </Link>
  )
}

function CategoryTile({
  category,
  href,
  tall,
  count,
}: {
  category: Category
  href: string
  tall: boolean
  count: number
}) {
  return (
    <Link
      href={href}
      className={`tile${tall ? ' tile--tall' : ''}`}
      style={{ '--tone-bg': category.tone[0], '--tone-fg': category.tone[1] } as React.CSSProperties}
    >
      <span className="tile__icon">
        <Icon name={category.icon} size={26} />
      </span>
      <span className="tile__text">
        <span className="tile__name">{category.name}</span>
        <span className="tile__count">{count} รายการ</span>
        <span className="tile__desc">{category.description}</span>
      </span>
      <span className="tile__more">
        ดูรายการ
        <Icon name="right" size={16} strokeWidth={2.2} />
      </span>
      <span className="tile__chevron">
        <Icon name="right" size={22} strokeWidth={2} />
      </span>
    </Link>
  )
}
