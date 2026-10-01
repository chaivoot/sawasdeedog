// TODO(build-spec): sample list. Replace with the full province/district list
// the team covers.
export type District = { slug: string; name: string }
export type Province = { slug: string; name: string; districts: District[] }

export const provinces: Province[] = [
  {
    slug: 'bangkok',
    name: 'กรุงเทพฯ',
    districts: [
      { slug: 'lat-krabang', name: 'ลาดกระบัง' },
      { slug: 'bang-na', name: 'บางนา' },
      { slug: 'prawet', name: 'ประเวศ' },
      { slug: 'min-buri', name: 'มีนบุรี' },
      { slug: 'suan-luang', name: 'สวนหลวง' },
    ],
  },
  {
    slug: 'nonthaburi',
    name: 'นนทบุรี',
    districts: [
      { slug: 'mueang-nonthaburi', name: 'เมืองนนทบุรี' },
      { slug: 'bang-bua-thong', name: 'บางบัวทอง' },
      { slug: 'pak-kret', name: 'ปากเกร็ด' },
    ],
  },
  {
    slug: 'pathum-thani',
    name: 'ปทุมธานี',
    districts: [
      { slug: 'mueang-pathum-thani', name: 'เมืองปทุมธานี' },
      { slug: 'khlong-luang', name: 'คลองหลวง' },
    ],
  },
  {
    slug: 'samut-prakan',
    name: 'สมุทรปราการ',
    districts: [
      { slug: 'mueang-samut-prakan', name: 'เมืองสมุทรปราการ' },
      { slug: 'bang-phli', name: 'บางพลี' },
    ],
  },
  {
    slug: 'chiang-mai',
    name: 'เชียงใหม่',
    districts: [
      { slug: 'mueang-chiang-mai', name: 'เมืองเชียงใหม่' },
      { slug: 'hang-dong', name: 'หางดง' },
    ],
  },
  {
    slug: 'chonburi',
    name: 'ชลบุรี',
    districts: [
      { slug: 'mueang-chonburi', name: 'เมืองชลบุรี' },
      { slug: 'bang-lamung', name: 'บางละมุง' },
    ],
  },
  // Farm-only provinces (farms are listed nationwide).
  { slug: 'nakhon-pathom', name: 'นครปฐม', districts: [] },
]

export type Area = { province: Province; district?: District }

export function findArea(provinceSlug?: string, districtSlug?: string): Area | undefined {
  const province = provinces.find((p) => p.slug === provinceSlug)
  if (!province) return undefined
  if (!districtSlug) return { province }
  const district = province.districts.find((d) => d.slug === districtSlug)
  return district ? { province, district } : undefined
}

export function areaPath(area?: Area): string {
  if (!area) return ''
  return `/${area.province.slug}` + (area.district ? `/${area.district.slug}` : '')
}

/** Name of the most specific level, e.g. "ลาดกระบัง" or "กรุงเทพฯ". */
export function areaName(area: Area): string {
  return area.district?.name ?? area.province.name
}

export const AREA_COOKIE = 'area'

/** Cookie value is "province/district" or "province". */
export function parseAreaCookie(value?: string): Area | undefined {
  if (!value) return undefined
  const [p, d] = value.split('/')
  return findArea(p, d)
}
