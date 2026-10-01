import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AreaPicker } from '@/components/AreaPicker'
import { Breadcrumb, type Crumb } from '@/components/Breadcrumb'
import { EmptyState } from '@/components/EmptyState'
import { Icon } from '@/components/Icon'
import { ListingCard } from '@/components/ListingCard'
import { ListingFilters, TrainerTabs } from '@/components/ListingControls'
import { listingHref, type ListingParams } from '@/lib/listing'
import { SiteHeader } from '@/components/SiteHeader'
import { getCategory, trainerStyles, type Category, type TrainerStyle } from '@/data/categories'
import { areaName, areaPath, findArea, type Area } from '@/data/areas'
import { listPlaces } from '@/lib/places'

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

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

function parseParams(category: Category, sp: Record<string, string | string[] | undefined>): ListingParams {
  const type = one(sp.type)
  const style = one(sp.style)
  const f = one(sp.f)?.split(',') ?? []
  return {
    type: category.types?.some((t) => t.slug === type) ? type : undefined,
    style:
      category.slug === 'trainer'
        ? (trainerStyles.find((s) => s.slug === style)?.slug ?? trainerStyles[0].slug)
        : undefined,
    filters: category.filters.map((x) => x.slug).filter((s) => f.includes(s)),
  }
}

function title(category: Category, area?: Area) {
  const base = category.listTitle ?? category.name
  return area ? `${base} ${areaName(area)}` : base
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug, area: segments } = await params
  const r = resolve(slug, segments)
  if (!r) return {}
  return {
    title: title(r.category, r.area),
    description: r.category.guarantee ?? r.category.description,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug, area: segments } = await params
  const r = resolve(slug, segments)
  if (!r) notFound()
  const { category, area } = r
  const isTrainer = category.slug === 'trainer'
  const lp = parseParams(category, await searchParams)
  const basePath = `/${category.slug}${areaPath(area)}`

  const places = listPlaces({
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

  const count = `พบ ${places.length} ที่ ที่ผ่านเกณฑ์`
  const filtered = lp.filters.length > 0 || !!lp.type
  const noun = category.shortName ?? category.name

  return (
    <>
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
                <span className="page-title__desktop-title">
                  {isTrainer ? category.name : title(category, area)}
                </span>
              </h1>
              {!isTrainer && (
                <span className="page-title__sub desktop-only">
                  {count}
                  {category.guaranteeShort && ` · ${category.guaranteeShort}`}
                </span>
              )}
            </div>
          </div>
          <div className="page-head__side">
            <AreaPicker
              province={area?.province.slug}
              district={area?.district?.slug}
              category={category.slug}
            />
          </div>
        </div>

        {category.guarantee && (
          <div className="guarantee mobile-only">
            <Icon name="checkc" size={18} strokeWidth={2} />
            {category.guarantee}
          </div>
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
              {!isTrainer && places.length > 0 && <span className="result-count mobile-only">{count}</span>}
              {places.map((p) => (
                <ListingCard key={p.slug} place={p} />
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
                    title={area ? `ยังไม่มี${noun}ในย่าน${areaName(area)}` : `ยังไม่มี${noun}ที่ผ่านเกณฑ์`}
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
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
