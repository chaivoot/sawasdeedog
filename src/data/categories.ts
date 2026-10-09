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
  /** Search-friendly heading for listing pages and page titles, e.g. "คาเฟ่หมาเข้าได้ ลาดกระบัง". Defaults to `name`. */
  listTitle?: string
  /** schema.org type for places in this category (structured data). */
  schemaType: string
  /** Pastel icon tile [background, icon colour], so categories are told apart at a glance. */
  tone: [string, string]
  /** Short noun for empty states, e.g. "ยังไม่มีคาเฟ่ในย่าน…". Defaults to `name`. */
  shortName?: string
  /** Segmented control (single choice). */
  types?: Option[]
  /** Toggle chips on mobile / checkboxes on desktop (multi choice). */
  filters: Option[]
  /** Restrictions a place may have; stored with the attributes, shown as warnings, never filtered on. */
  warnings?: Option[]
  /**
   * Photo behind the featured home tile: /featured/<slug>-800.jpg and -1600.jpg in public/
   * (Pexels, free to use). `position` is the CSS object-position that keeps the dog in view.
   */
  cover?: { position: string }
}

// Order is the order of the home grid. Farm is browsed by breed, not area.
// TODO(build-spec): types/filters for categories other than cafe and trainer
// are drafted from the home-card descriptions; confirm against build-spec.md.
/**
 * A place's type within one of its extra categories, kept with its attributes
 * ("park:pool"), since the type column belongs to the main category.
 */
export const extraTypeToken = (category: string, type: string) => `${category}:${type}`

/** Type options, as attribute tokens, for a category a place is listed in as an extra. */
export function extraTypeOptions(c: Category): Option[] {
  return (c.types ?? []).map((t) => ({ slug: extraTypeToken(c.slug, t.slug), label: t.label }))
}

export const categories: Category[] = [
  {
    slug: 'cafe',
    cover: { position: '50% 30%' },
    icon: 'cafe',
    tone: ['#dff3e8', '#1e7a4c'],
    name: 'คาเฟ่ & ร้านอาหาร',
    schemaType: 'CafeOrCoffeeShop',
    description: 'คาเฟ่และร้านอาหารที่พาน้องหมาเข้าได้จริง',
    tagline: 'คาเฟ่และร้านอาหารที่พาน้องหมาเข้าได้จริง',
    listTitle: 'คาเฟ่หมาเข้าได้',
    shortName: 'คาเฟ่',
    types: [
      { slug: 'cafe', label: 'คาเฟ่' },
      { slug: 'restaurant', label: 'ร้านอาหาร' },
    ],
    filters: [
      { slug: 'dog-menu', label: 'มีเมนูหมา' },
      { slug: 'parking', label: 'มีที่จอดรถ' },
    ],
  },
  {
    slug: 'vet',
    cover: { position: '50% 65%' },
    icon: 'vet',
    tone: ['#ffe4e4', '#b03a3a'],
    name: 'โรงพยาบาลสัตว์ & คลินิก',
    schemaType: 'VeterinaryCare',
    listTitle: 'โรงพยาบาลสัตว์ & คลินิกรักษาหมา',
    description: 'โรงพยาบาลและคลินิก',
    types: [
      { slug: 'hospital', label: 'โรงพยาบาล' },
      { slug: 'clinic', label: 'คลินิก' },
    ],
    filters: [{ slug: 'open-24h', label: 'เปิด 24 ชม.' }],
  },
  {
    slug: 'trainer',
    cover: { position: '40% 75%' },
    icon: 'trainer',
    tone: ['#e3ecff', '#2a4fb3'],
    name: 'ครูฝึกหมา',
    schemaType: 'ProfessionalService',
    description: 'ครูฝึกสุนัข แยกแนว Force-Free และ Balance ให้ชัด',
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
    tone: ['#ece6ff', '#5b3fb3'],
    name: 'ฟิตเนส & กายภาพ',
    schemaType: 'LocalBusiness',
    listTitle: 'ฟิตเนสหมา & กายภาพบำบัด',
    description: 'ฟิตเนสหมา กายภาพบำบัด ธาราบำบัด ฝังเข็ม',
    filters: [
      { slug: 'fitness', label: 'ฟิตเนส' },
      { slug: 'physio', label: 'กายภาพบำบัด' },
      { slug: 'hydro', label: 'ธาราบำบัด' },
      { slug: 'acupuncture', label: 'ฝังเข็ม' },
    ],
  },
  {
    slug: 'grooming',
    cover: { position: '60% 35%' },
    icon: 'grooming',
    tone: ['#dff4f4', '#1c7373'],
    name: 'อาบน้ำ & ตัดขน',
    schemaType: 'LocalBusiness',
    listTitle: 'อาบน้ำตัดขนหมา',
    description: 'หน้าร้าน และบริการถึงบ้าน',
    types: [
      { slug: 'shop', label: 'หน้าร้าน' },
      { slug: 'mobile', label: 'ถึงบ้าน' },
    ],
    filters: [],
    warnings: [{ slug: 'small-dogs-only', label: 'รับเฉพาะน้องหมาตัวเล็ก' }],
  },
  {
    slug: 'stay',
    cover: { position: '60% 35%' },
    icon: 'stay',
    tone: ['#ffe8d6', '#b4501d'],
    name: 'ที่พักหมาพักได้',
    schemaType: 'LodgingBusiness',
    listTitle: 'ที่พักหมาพักได้',
    description: 'โรงแรม รีสอร์ท พูลวิลล่า หมาพักได้ เจ้าของพักด้วยได้',
    types: [
      { slug: 'hotel', label: 'โรงแรม' },
      { slug: 'resort', label: 'รีสอร์ท' },
      { slug: 'villa', label: 'พูลวิลล่า/บ้านเหมาหลัง' },
      { slug: 'glamping', label: 'แกลมปิ้ง/แคมป์' },
    ],
    filters: [
      { slug: 'no-pet-fee', label: 'ไม่มีค่าน้องหมา' },
      { slug: 'dog-pool', label: 'มีสระที่น้องลงได้' },
      { slug: 'fenced-yard', label: 'มีสนามหญ้าล้อมรั้ว' },
      { slug: 'beach', label: 'พาน้องลงชายหาดได้' },
      { slug: 'dog-amenities', label: 'มีที่นอน/ชามให้น้อง' },
    ],
    // Every stay takes dogs of 15 kg or more (stayRule); its weight limit and these are shown as warnings.
    warnings: [
      { slug: 'no-restaurant', label: 'ห้ามน้องหมาเข้าร้านอาหาร' },
      { slug: 'no-pool', label: 'ห้ามน้องหมาลงสระว่ายน้ำของคน' },
      { slug: 'no-common-areas', label: 'ห้ามน้องหมาเข้าล็อบบี้/พื้นที่ส่วนกลาง' },
      { slug: 'no-bed', label: 'ห้ามน้องหมาขึ้นเตียง/โซฟา' },
      { slug: 'breed-ban', label: 'ห้ามสายพันธุ์หมาดุบางสายพันธุ์' },
      { slug: 'designated-rooms', label: 'พักได้เฉพาะห้องที่กำหนด' },
      { slug: 'not-left-alone', label: 'ห้ามทิ้งน้องหมาไว้ในห้องลำพัง' },
      { slug: 'leash-required', label: 'ต้องใส่สายจูงนอกห้องพัก' },
      { slug: 'diaper-required', label: 'ต้องใส่ผ้าอ้อมให้น้อง' },
      { slug: 'vaccine-record', label: 'ต้องแสดงสมุดวัคซีน' },
      { slug: 'direct-booking-only', label: 'ต้องจองตรงกับที่พัก (จองผ่านแอปไม่ได้)' },
    ],
  },
  {
    slug: 'boarding',
    icon: 'boarding',
    tone: ['#f6e2f5', '#8a3584'],
    name: 'ฝากเลี้ยง',
    schemaType: 'LocalBusiness',
    listTitle: 'ฝากเลี้ยงหมา',
    description: 'รายวัน (daycare) และค้างคืน',
    types: [
      { slug: 'daycare', label: 'รายวัน' },
      { slug: 'overnight', label: 'ค้างคืน' },
    ],
    filters: [],
    warnings: [{ slug: 'small-dogs-only', label: 'รับเฉพาะน้องหมาตัวเล็ก' }],
  },
  {
    slug: 'sitter',
    icon: 'sitter',
    tone: ['#e6f2d9', '#4c7a1e'],
    name: 'Pet sitter & พาเดิน',
    schemaType: 'LocalBusiness',
    listTitle: 'รับเลี้ยงหมา & พาหมาเดิน',
    description: 'เลี้ยงที่บ้านเจ้าของ และพาเดิน',
    types: [
      { slug: 'sitting', label: 'เลี้ยงที่บ้าน' },
      { slug: 'walking', label: 'พาเดิน' },
    ],
    filters: [],
    warnings: [{ slug: 'small-dogs-only', label: 'รับเฉพาะน้องหมาตัวเล็ก' }],
  },
  {
    slug: 'park',
    cover: { position: '40% 50%' },
    icon: 'park',
    tone: ['#fff1c2', '#7a5a00'],
    name: 'ลานวิ่ง & สระว่ายน้ำหมา',
    schemaType: 'LocalBusiness',
    listTitle: 'ลานวิ่งหมา & สระว่ายน้ำหมา',
    description: 'ลานวิ่งฟรี เสียค่าเข้า และสระว่ายน้ำ',
    types: [
      { slug: 'run', label: 'ลานวิ่ง' },
      { slug: 'pool', label: 'สระว่ายน้ำ' },
    ],
    filters: [
      { slug: 'free', label: 'เข้าฟรี' },
      { slug: 'paid', label: 'เสียค่าเข้า' },
    ],
    // Listed even with size limits (serviceRule); its weight limit and these are shown as warnings.
    warnings: [
      { slug: 'small-dogs-only', label: 'รับเฉพาะน้องหมาตัวเล็ก' },
      { slug: 'leash-only', label: 'ต้องจูงสายตลอด ปล่อยวิ่งไม่ได้' },
      { slug: 'registration-required', label: 'ต้องลงทะเบียนน้องหมาก่อนเข้า' },
      { slug: 'booking-required', label: 'ต้องจองคิวล่วงหน้า' },
      { slug: 'vaccine-record', label: 'ต้องแสดงสมุดวัคซีน' },
    ],
  },
  {
    slug: 'farewell',
    icon: 'farewell',
    tone: ['#e9ecf1', '#4b5a6e'],
    name: 'การเดินทางครั้งสุดท้าย',
    schemaType: 'LocalBusiness',
    listTitle: 'เตาเผาสุนัข & วัดรับเผาสุนัข',
    shortName: 'ที่ฌาปนกิจ',
    description: 'ฌาปนกิจ และพิธีส่งน้องอย่างอบอุ่น',
    filters: [],
  },
  {
    slug: 'farm',
    icon: 'farm',
    tone: ['#f3e7da', '#7a4e24'],
    name: 'ฟาร์ม',
    schemaType: 'LocalBusiness',
    listTitle: 'ฟาร์มสุนัข',
    description: 'เลือกตามสายพันธุ์ ไม่ต้องเลือกย่าน',
    // Not a listing rule: research often can't confirm it, so it is shown as a badge when known.
    filters: [{ slug: 'pedigree', label: 'มีใบเพ็ดดีกรี' }],
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
    blurb:
      'ครูที่ใช้ทั้งการให้รางวัลและการบังคับหรือแก้พฤติกรรม (correction) ร่วมกัน เช่น กระตุกหรือดึงสายจูง',
  },
] as const

export type TrainerStyle = (typeof trainerStyles)[number]['slug']

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

/** Categories browsed by area (everything except farm). */
export const areaCategories = categories.filter((c) => c.slug !== 'farm')

/** Categories a place can be listed under besides its main one. Farm is browsed by breed, so it is main-only. */
export function extraCategoryOptions(main: string): Category[] {
  return categories.filter((c) => c.slug !== 'farm' && c.slug !== main)
}

/** Categories the home page's daily "วันนี้ชวนไป" tile rotates through. */
// Farewell is there when needed, never something to suggest for the day.
const NOT_FEATURED = ['farm', 'sitter', 'boarding', 'farewell', 'rehab']
export const featuredCategories = categories.filter((c) => !NOT_FEATURED.includes(c.slug))
