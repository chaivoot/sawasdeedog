import type { IconName } from '@/components/Icon'

export type Option = { slug: string; label: string }

export type Category = {
  slug: string
  icon: IconName
  name: string
  /** Short line under the name on desktop home cards. */
  description: string
  /** Longer line used when this category is the featured home tile. */
  tagline?: string
  /** Desktop H1 prefix on listing pages, e.g. "คาเฟ่หมาเข้าได้ ลาดกระบัง". Defaults to `name`. */
  listTitle?: string
  /** Short noun for empty states, e.g. "ยังไม่มีคาเฟ่ในย่าน…". Defaults to `name`. */
  shortName?: string
  /** Segmented control (single choice). */
  types?: Option[]
  /** Toggle chips on mobile / checkboxes on desktop (multi choice). */
  filters: Option[]
}

// Order is the order of the home grid. Farm is browsed by breed, not area.
// TODO(build-spec): types/filters for categories other than cafe and trainer
// are drafted from the home-card descriptions; confirm against build-spec.md.
export const categories: Category[] = [
  {
    slug: 'cafe',
    icon: 'cafe',
    name: 'คาเฟ่ & ร้านอาหาร',
    description: 'คาเฟ่และร้านอาหารที่พาน้องหมาเข้าได้จริง',
    tagline: 'คาเฟ่และร้านอาหารที่พาน้องหมาเข้าได้จริง',
    listTitle: 'คาเฟ่หมาเข้าได้',
    shortName: 'คาเฟ่',
    types: [
      { slug: 'cafe', label: 'คาเฟ่' },
      { slug: 'restaurant', label: 'ร้านอาหาร' },
    ],
    filters: [
      { slug: 'large-dog', label: 'รับหมาใหญ่' },
      { slug: 'dog-menu', label: 'มีเมนูหมา' },
      { slug: 'parking', label: 'มีที่จอดรถ' },
    ],
  },
  {
    slug: 'vet',
    icon: 'vet',
    name: 'โรงพยาบาลสัตว์ & คลินิก',
    description: 'โรงพยาบาล คลินิก และเฉพาะทาง',
    types: [
      { slug: 'hospital', label: 'โรงพยาบาล' },
      { slug: 'clinic', label: 'คลินิก' },
      { slug: 'specialist', label: 'เฉพาะทาง' },
    ],
    filters: [{ slug: 'open-24h', label: 'เปิด 24 ชม.' }],
  },
  {
    slug: 'trainer',
    icon: 'trainer',
    name: 'ครูฝึก',
    description: 'แยกแนว Force-Free และ Balance ให้ชัด',
    filters: [
      { slug: 'home-visit', label: 'สอนถึงบ้าน' },
      { slug: 'day-school', label: 'โรงเรียนไปกลับ' },
      { slug: 'board-and-train', label: 'ฝากฝึก' },
      { slug: 'group-class', label: 'คลาสกลุ่ม' },
      { slug: 'online', label: 'ออนไลน์' },
    ],
  },
  {
    slug: 'rehab',
    icon: 'rehab',
    name: 'กายภาพ & ฟื้นฟู',
    description: 'กายภาพบำบัด ธาราบำบัด ฝังเข็ม',
    filters: [
      { slug: 'physio', label: 'กายภาพบำบัด' },
      { slug: 'hydro', label: 'ธาราบำบัด' },
      { slug: 'acupuncture', label: 'ฝังเข็ม' },
    ],
  },
  {
    slug: 'grooming',
    icon: 'grooming',
    name: 'อาบน้ำ & ตัดขน',
    description: 'หน้าร้าน และบริการถึงบ้าน',
    types: [
      { slug: 'shop', label: 'หน้าร้าน' },
      { slug: 'mobile', label: 'ถึงบ้าน' },
    ],
    filters: [{ slug: 'large-dog', label: 'รับหมาใหญ่' }],
  },
  {
    slug: 'stay',
    icon: 'stay',
    name: 'ที่พักพร้อมหมา',
    description: 'โรงแรม รีสอร์ท ที่เจ้าของพักด้วยได้',
    types: [
      { slug: 'hotel', label: 'โรงแรม' },
      { slug: 'resort', label: 'รีสอร์ท' },
    ],
    filters: [{ slug: 'large-dog', label: 'รับหมาใหญ่' }],
  },
  {
    slug: 'boarding',
    icon: 'boarding',
    name: 'ฝากเลี้ยง',
    description: 'รายวัน (daycare) และค้างคืน',
    types: [
      { slug: 'daycare', label: 'รายวัน' },
      { slug: 'overnight', label: 'ค้างคืน' },
    ],
    filters: [{ slug: 'large-dog', label: 'รับหมาใหญ่' }],
  },
  {
    slug: 'sitter',
    icon: 'sitter',
    name: 'Pet sitter & พาเดิน',
    description: 'เลี้ยงที่บ้านเจ้าของ และพาเดิน',
    types: [
      { slug: 'sitting', label: 'เลี้ยงที่บ้าน' },
      { slug: 'walking', label: 'พาเดิน' },
    ],
    filters: [],
  },
  {
    slug: 'park',
    icon: 'park',
    name: 'ลานวิ่ง & สระว่ายน้ำหมา',
    description: 'ลานวิ่งฟรี เสียค่าเข้า และสระว่ายน้ำ',
    types: [
      { slug: 'run', label: 'ลานวิ่ง' },
      { slug: 'pool', label: 'สระว่ายน้ำ' },
    ],
    filters: [
      { slug: 'free', label: 'เข้าฟรี' },
      { slug: 'paid', label: 'เสียค่าเข้า' },
    ],
  },
  {
    slug: 'transport',
    icon: 'transport',
    name: 'ขนส่ง',
    description: 'ในเมือง ต่างจังหวัด ไปสนามบิน',
    filters: [
      { slug: 'in-city', label: 'ในเมือง' },
      { slug: 'intercity', label: 'ต่างจังหวัด' },
      { slug: 'airport', label: 'ไปสนามบิน' },
    ],
  },
  {
    slug: 'farm',
    icon: 'farm',
    name: 'ฟาร์ม',
    description: 'เลือกตามสายพันธุ์ ไม่ต้องเลือกย่าน',
    filters: [],
  },
]

/**
 * Trainer tabs. Both tabs must look identical; neither is styled as "better".
 * The stored value for Force-Free stays `rplus` (database + URL) so existing
 * listings and links keep working; only the labels changed.
 */
export const trainerStyles = [
  {
    slug: 'rplus',
    label: 'Force-Free',
    blurb: 'ครูที่ไม่ใช้ความเจ็บ ความอึดอัด หรือความกลัวในการฝึก',
  },
  {
    slug: 'balance',
    label: 'Balance (มีการบังคับ)',
    blurb: 'ครูที่ใช้ทั้งการให้รางวัลและการบังคับหรือแก้พฤติกรรม (correction) ร่วมกัน',
  },
] as const

export type TrainerStyle = (typeof trainerStyles)[number]['slug']

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

/** Categories browsed by area (everything except farm). */
export const areaCategories = categories.filter((c) => c.slug !== 'farm')
