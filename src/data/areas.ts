// Bangkok has all 50 districts. TODO: other provinces are still a sample list;
// add districts as the team covers them.
export type District = { slug: string; name: string }
export type Province = { slug: string; name: string; districts: District[] }

export const provinces: Province[] = [
  {
    slug: 'bangkok',
    name: 'กรุงเทพฯ',
    // All 50 districts. Sorted in Thai alphabetical order at module load.
    districts: [
      { slug: 'phra-nakhon', name: 'พระนคร' },
      { slug: 'dusit', name: 'ดุสิต' },
      { slug: 'nong-chok', name: 'หนองจอก' },
      { slug: 'bang-rak', name: 'บางรัก' },
      { slug: 'bang-khen', name: 'บางเขน' },
      { slug: 'bang-kapi', name: 'บางกะปิ' },
      { slug: 'pathum-wan', name: 'ปทุมวัน' },
      { slug: 'pom-prap-sattru-phai', name: 'ป้อมปราบศัตรูพ่าย' },
      { slug: 'phra-khanong', name: 'พระโขนง' },
      { slug: 'min-buri', name: 'มีนบุรี' },
      { slug: 'lat-krabang', name: 'ลาดกระบัง' },
      { slug: 'yan-nawa', name: 'ยานนาวา' },
      { slug: 'samphanthawong', name: 'สัมพันธวงศ์' },
      { slug: 'phaya-thai', name: 'พญาไท' },
      { slug: 'thon-buri', name: 'ธนบุรี' },
      { slug: 'bangkok-yai', name: 'บางกอกใหญ่' },
      { slug: 'huai-khwang', name: 'ห้วยขวาง' },
      { slug: 'khlong-san', name: 'คลองสาน' },
      { slug: 'taling-chan', name: 'ตลิ่งชัน' },
      { slug: 'bangkok-noi', name: 'บางกอกน้อย' },
      { slug: 'bang-khun-thian', name: 'บางขุนเทียน' },
      { slug: 'phasi-charoen', name: 'ภาษีเจริญ' },
      { slug: 'nong-khaem', name: 'หนองแขม' },
      { slug: 'rat-burana', name: 'ราษฎร์บูรณะ' },
      { slug: 'bang-phlat', name: 'บางพลัด' },
      { slug: 'din-daeng', name: 'ดินแดง' },
      { slug: 'bueng-kum', name: 'บึงกุ่ม' },
      { slug: 'sathon', name: 'สาทร' },
      { slug: 'bang-sue', name: 'บางซื่อ' },
      { slug: 'chatuchak', name: 'จตุจักร' },
      { slug: 'bang-kho-laem', name: 'บางคอแหลม' },
      { slug: 'prawet', name: 'ประเวศ' },
      { slug: 'khlong-toei', name: 'คลองเตย' },
      { slug: 'suan-luang', name: 'สวนหลวง' },
      { slug: 'chom-thong', name: 'จอมทอง' },
      { slug: 'don-mueang', name: 'ดอนเมือง' },
      { slug: 'ratchathewi', name: 'ราชเทวี' },
      { slug: 'lat-phrao', name: 'ลาดพร้าว' },
      { slug: 'watthana', name: 'วัฒนา' },
      { slug: 'bang-khae', name: 'บางแค' },
      { slug: 'lak-si', name: 'หลักสี่' },
      { slug: 'sai-mai', name: 'สายไหม' },
      { slug: 'khan-na-yao', name: 'คันนายาว' },
      { slug: 'saphan-sung', name: 'สะพานสูง' },
      { slug: 'wang-thonglang', name: 'วังทองหลาง' },
      { slug: 'khlong-sam-wa', name: 'คลองสามวา' },
      { slug: 'bang-na', name: 'บางนา' },
      { slug: 'thawi-watthana', name: 'ทวีวัฒนา' },
      { slug: 'thung-khru', name: 'ทุ่งครุ' },
      { slug: 'bang-bon', name: 'บางบอน' },
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

const thai = new Intl.Collator('th')
for (const p of provinces) p.districts.sort((a, b) => thai.compare(a.name, b.name))

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
