import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { categoryRule } from '@/data/criteria'
import { AreaPicker } from '@/components/AreaPicker'
import { Breadcrumb, type Crumb } from '@/components/Breadcrumb'
import { EmptyState } from '@/components/EmptyState'
import { Icon } from '@/components/Icon'
import { ListingCard } from '@/components/ListingCard'
import { NearbyResults } from '@/components/NearbyResults'
import { ListingFilters, TrainerTabs } from '@/components/ListingControls'
import { listingHref, parseListingParams } from '@/lib/listing'
import { SiteHeader } from '@/components/SiteHeader'
import { getCategory, type Category, type TrainerStyle } from '@/data/categories'
import { areaName, areaPath, findArea, type Area } from '@/data/areas'
import { JsonLd } from '@/components/JsonLd'
import { areaCounts, listPlaces } from '@/lib/places'
import { DEFAULT_OG_IMAGE, absoluteUrl } from '@/lib/site'

type Props = {
  params: Promise<{ category: string; area?: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function resolve(categorySlug: string, segments: string[] = []) {
  const category = getCategory(categorySlug)
  // Farm is browsed by breed at /farm (a static route that wins over this one).
  if (!category || category.slug === 'farm' || segments.length > 2) return undefined
  const area = segments.length ? findArea(segments[0], segments[1]) : undefined
  if (segments.length && !area) return undefined
  return { category, area }
}

function title(category: Category, area?: Area) {
  const base = category.listTitle ?? category.name
  return area ? `${base} ${areaName(area)}` : base
}

/** Page title for search results, e.g. "คาเฟ่หมาเข้าได้ ลาดกระบัง กรุงเทพฯ". */
function seoTitle(category: Category, area?: Area) {
  const base = category.listTitle ?? category.name
  if (!area) return base
  return area.district
    ? `${base} ${area.district.name} ${area.province.name}`
    : `${base} ${area.province.name}`
}

function seoDescription(category: Category, area: Area | undefined, count: number) {
  const where = area
    ? area.district
      ? `${area.district.name} ${area.province.name}`
      : area.province.name
    : ''
  const lead =
    count > 0
      ? `รวม ${count} ${category.name}${where ? `ใน${where}` : ''}`
      : `${category.name}${where ? `ใน${where}` : ''}`
  const rule = categoryRule(category.slug)?.banner ?? category.description
  return `${lead} ที่ทีม SawasdeeDog คัดแล้ว · ${rule}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug, area: segments } = await params
  const r = resolve(slug, segments)
  if (!r) return {}
  const places = await listPlaces({ category: r.category.slug, area: r.area })
  const path = `/${r.category.slug}${areaPath(r.area)}`
  const title = seoTitle(r.category, r.area)
  const description = seoDescription(r.category, r.area, places.length)
  return {
    title,
    description,
    // Filtered views (?type=, ?f=) all point at the unfiltered page.
    alternates: { canonical: path },
    // Empty area pages are thin content; keep them out of the index until they have places.
    robots: r.area && places.length === 0 ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: path, images: [DEFAULT_OG_IMAGE] },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug, area: segments } = await params
  const r = resolve(slug, segments)
  if (!r) notFound()
  const { category, area } = r
  const isTrainer = category.slug === 'trainer'
  const rule = categoryRule(category.slug)
  const lp = parseListingParams(category, await searchParams)
  // "ใกล้ฉัน" only applies to the all-areas page; the list is filled in the browser.
  const near = lp.near && !area
  if (!near) lp.near = false
  const basePath = `/${category.slug}${areaPath(area)}`

  const places = await listPlaces({
    category: category.slug,
    area,
    type: lp.type,
    trainerStyle: lp.style as TrainerStyle | undefined,
    filters: lp.filters,
  })

  const crumbs: Crumb[] = [{ label: 'หน้าแรก', href: '/' }]
  crumbs.push({ label: category.name, href: area ? `/${category.slug}` : undefined })
  if (area) {
    crumbs.push({
      label: area.province.name,
      href: area.district ? `/${category.slug}/${area.province.slug}` : undefined,
    })
    if (area.district) crumbs.push({ label: area.district.name })
  }

  const nearby = await areaLinks(category, area)

  const count = `พบ ${places.length} ที่ ที่ผ่านเกณฑ์`
  const filtered = lp.filters.length > 0 || !!lp.type
  const noun = category.shortName ?? category.name

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { name: 'หน้าแรก', path: '/' },
      { name: category.name, path: `/${category.slug}` },
      ...(area ? [{ name: area.province.name, path: `/${category.slug}/${area.province.slug}` }] : []),
      ...(area?.district ? [{ name: area.district.name, path: basePath }] : []),
    ].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
  }
  const listLd = places.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: seoTitle(category, area),
        itemListElement: places.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.name,
          url: absoluteUrl(`/place/${p.slug}`),
        })),
      }
    : undefined

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      {listLd && <JsonLd data={listLd} />}
      <SiteHeader back="/" />
      <main className="page">
        <Breadcrumb items={crumbs} />

        <div className="page-head">
          <div className={`page-title${isTrainer ? '' : ' page-title--plain'}`}>
            <span className="page-title__icon">
              <Icon name={category.icon} size={26} />
            </span>
            <div className="page-title__text page-title__text--count">
              <h1>
                <span className="page-title__mobile-title">{category.name}</span>
                <span className="page-title__desktop-title">{title(category, area)}</span>
              </h1>
              {!isTrainer && !near && (
                <span className="page-title__sub desktop-only">
                  {count}
                  {rule && ` · ${rule.short}`}
                </span>
              )}
            </div>
          </div>
          <div className="page-head__side">
            <AreaPicker
              province={area?.province.slug}
              district={area?.district?.slug}
              category={category.slug}
              near={near}
            />
          </div>
        </div>

        {rule && (
          <Link href={`/criteria#${rule.anchor}`} className="guarantee mobile-only">
            <Icon name="checkc" size={18} strokeWidth={2} />
            {rule.banner}
          </Link>
        )}

        {isTrainer && <TrainerTabs basePath={basePath} params={lp} />}

        <div className="listing-layout">
          {(category.types?.length || category.filters.length > 0) && (
            <aside className="filter-aside">
              <ListingFilters
                basePath={basePath}
                params={lp}
                types={category.types}
                filters={category.filters}
                filterLabel={isTrainer ? 'รูปแบบบริการ' : 'ตัวกรอง'}
              />
            </aside>
          )}
          <div className="listing-layout__main">
            <div className="listing-list">
              {near ? (
                <NearbyResults category={category.slug} noun={noun} params={lp} />
              ) : (
                <>
                  {!isTrainer && places.length > 0 && (
                    <span className="result-count mobile-only">{count}</span>
                  )}
                  {places.map((p) => (
                    <ListingCard key={p.slug} place={p} listing={category.slug} />
                  ))}
                  {places.length === 0 &&
                    (filtered ? (
                      <EmptyState
                        title="ยังไม่มีที่ที่ตรงกับตัวกรองนี้"
                        body="ลองเอาตัวกรองบางข้อออก หรือถ้ารู้จักที่ดี ๆ เสนอให้ทีมช่วยเช็คได้เลย"
                        primary={{ href: '/submit', label: 'เสนอสถานที่' }}
                        secondary={{
                          href: listingHref(basePath, { style: lp.style, filters: [] }),
                          label: 'ล้างตัวกรอง',
                        }}
                      />
                    ) : (
                      <EmptyState
                        title={
                          area ? `ยังไม่มี${noun}ในย่าน${areaName(area)}` : `ยังไม่มี${noun}ที่ผ่านเกณฑ์`
                        }
                        body="เรายังคัดไม่ครบทุกย่าน ถ้ารู้จักที่ดี ๆ แถวนี้ เสนอให้ทีมช่วยเช็คได้เลย"
                        primary={{ href: '/submit', label: 'เสนอสถานที่' }}
                        secondary={
                          area?.district
                            ? { href: `/${category.slug}/${area.province.slug}`, label: 'ดูทั้งจังหวัด' }
                            : area
                              ? { href: `/${category.slug}`, label: 'ดูทุกย่าน' }
                              : undefined
                        }
                      />
                    ))}
                </>
              )}
            </div>
          </div>
        </div>

        {nearby.links.length > 0 && (
          <nav className="area-links" aria-labelledby="area-links-title">
            <h2 id="area-links-title">{nearby.title}</h2>
            <ul>
              {nearby.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>
                    {l.label} <span className="muted">({l.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>
    </>
  )
}

type AreaLink = { href: string; label: string; count: number }

/**
 * Crawlable links to sub-areas that actually have places: provinces on the
 * category root, districts on a province page, sibling districts on a district page.
 */
async function areaLinks(category: Category, area?: Area): Promise<{ title: string; links: AreaLink[] }> {
  const counts = await areaCounts(category.slug)
  const noun = category.shortName ?? category.name
  const links: AreaLink[] = []
  if (!area) {
    for (const c of counts) {
      const a = !c.district && findArea(c.province)
      if (a) links.push({ href: `/${category.slug}${areaPath(a)}`, label: a.province.name, count: c.count })
    }
    return { title: `${noun}ตามจังหวัด`, links: links.sort((x, y) => y.count - x.count) }
  }
  for (const c of counts) {
    if (c.province !== area.province.slug || !c.district || c.district === area.district?.slug) continue
    const a = findArea(c.province, c.district)
    if (a?.district)
      links.push({ href: `/${category.slug}${areaPath(a)}`, label: a.district.name, count: c.count })
  }
  return {
    title: `${noun}ในเขต/อำเภอ${area.district ? 'อื่น' : ''}ของ${area.province.name}`,
    links: links.sort((x, y) => y.count - x.count),
  }
}
