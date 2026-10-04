import type { Option } from './categories'

// The site-wide selection rule, worded so it isn't tied to any one category.
// Shown on /criteria, listing pages, place pages and the admin editor.
export const dogFriendly = {
  /** Headline term. */
  name: 'Dog Friendly ที่จริงใจ',
  /** Definition shown in the highlighted box on /criteria. */
  definition:
    'ต้อนรับน้องหมาอย่างจริงใจ ไม่มีเงื่อนไขแอบแฝง น้องหมาไปได้ทุกที่ที่คนไปได้ ไม่จำกัดขนาดหรือน้ำหนัก',
  /** Banner on listing pages. */
  banner: 'ทุกที่ในนี้ต้อนรับน้องหมาจริง ไม่มีเงื่อนไขแอบแฝง',
  /** Desktop listing subtitle. */
  short: 'Dog Friendly ไม่มีเงื่อนไขแอบแฝง',
  /** First item of "ผ่านเกณฑ์อะไรบ้าง" on place pages. */
  criterion: 'Dog Friendly ไม่มีเงื่อนไขแอบแฝง',
}

/**
 * The Dog Friendly rule is for places made for people that welcome dogs (cafés and
 * restaurants), where "pet friendly" is often a trend with hidden conditions.
 * Stays have their own rule; dog services have theirs (serviceRule).
 */
export function hasDogFriendlyRule(categorySlug: string) {
  return categorySlug === 'cafe'
}

/** Services made for dogs: listed even with size limits, which show as warnings. */
export const SERVICE_CATEGORIES = ['vet', 'rehab', 'grooming', 'boarding', 'sitter', 'park']

/** Categories whose places can have a weight limit (shown as a warning). */
export function takesWeightLimit(categorySlug: string) {
  return categorySlug === 'stay' || SERVICE_CATEGORIES.includes(categorySlug)
}

/** Stays must take dogs at least this heavy. */
export const STAY_MIN_DOG_KG = 15

/**
 * Stays almost always keep dogs out of somewhere (restaurant, pool), so the bar
 * is size: dogs of 15 kg or more must be welcome. Other limits are shown as warnings.
 */
export const stayRule = {
  banner: `ทุกที่พักในนี้รับน้องหมาหนัก ${STAY_MIN_DOG_KG} กก. ขึ้นไปได้`,
  short: `รับน้องหมา ${STAY_MIN_DOG_KG} กก. ขึ้นไป`,
  criterion: `รับน้องหมาหนัก ${STAY_MIN_DOG_KG} กก. ขึ้นไป`,
  body: `ที่พักส่วนใหญ่มีบางโซนที่น้องหมาเข้าไม่ได้ เราจึงใช้เกณฑ์แยก คือต้องรับน้องหมาที่หนัก ${STAY_MIN_DOG_KG} กิโลกรัมขึ้นไปได้ ที่พักที่รับเฉพาะน้องตัวเล็กกว่านั้นเราไม่ลิสต์ ส่วนข้อจำกัดอื่น เช่น จำกัดน้ำหนักที่กี่กิโล ห้ามเข้าร้านอาหาร ห้ามลงสระ หรือห้ามบางสายพันธุ์ เราขึ้นเตือนไว้ในหน้าที่พักแต่ละที่`,
}

/**
 * Dog services exist for dogs already, so the bar is just that: they take dogs (not
 * cats only). Size limits and other conditions are listed and shown as warnings.
 */
export const serviceRule = {
  banner: 'บริการสำหรับน้องหมา ที่ไหนจำกัดขนาดหรือมีเงื่อนไข เราขึ้นเตือนไว้ในหน้าของที่นั้น',
  short: 'ข้อจำกัดแจ้งไว้ในหน้าแต่ละที่',
  criterion: 'แจ้งข้อจำกัดไว้ชัด ไม่มีเงื่อนไขแอบแฝง',
  body: 'โรงพยาบาลสัตว์ ฟิตเนส อาบน้ำตัดขน ฝากเลี้ยง พี่เลี้ยง ลานวิ่ง และสระว่ายน้ำ ทำมาเพื่อน้องหมาอยู่แล้ว เราจึงลิสต์ทุกที่ที่รับน้องหมา (ไม่ลิสต์ที่ที่รับเฉพาะแมว) ถ้าที่ไหนจำกัดขนาดหรือมีเงื่อนไข เช่น จำกัดน้ำหนักที่กี่กิโล รับเฉพาะน้องตัวเล็ก ต้องจูงสาย หรือต้องจองคิวก่อน เราขึ้นเตือนไว้ในหน้าของที่นั้น จะได้รู้ก่อนไป',
}

/** Warnings for a place: its weight limit and the restrictions ticked for its categories. */
export function placeWarnings(
  p: { maxDogKg?: number; maxDogs?: number; attributes: string[] },
  warnings: Option[],
): string[] {
  const out: string[] = []
  if (p.maxDogKg) out.push(`จำกัดน้ำหนักน้องหมาไม่เกิน ${p.maxDogKg} กก.`)
  if (p.maxDogs) out.push(`รับน้องหมาได้ไม่เกิน ${p.maxDogs} ตัวต่อห้อง`)
  for (const w of warnings) if (p.attributes.includes(w.slug) && !out.includes(w.label)) out.push(w.label)
  return out
}

/** The listing rule for a category, if it has one; `anchor` is its section on /criteria. */
export function categoryRule(
  categorySlug: string,
): { anchor: string; banner: string; short: string; criterion: string } | undefined {
  if (categorySlug === 'stay') return { anchor: 'stay', ...stayRule }
  if (SERVICE_CATEGORIES.includes(categorySlug)) return { anchor: 'service', ...serviceRule }
  if (hasDogFriendlyRule(categorySlug)) return { anchor: 'dog-friendly', ...dogFriendly }
}

/** Farm attribute for "issues a pedigree certificate"; shown as a badge, not required to be listed. */
export const PEDIGREE = 'pedigree'

/**
 * Farms aren't required to issue a pedigree (it often can't be confirmed from outside),
 * so the ones we could confirm carry a badge instead.
 */
export const farmRule = {
  badge: 'มีใบเพ็ดดีกรี',
  banner: 'ฟาร์มที่มีป้าย "มีใบเพ็ดดีกรี" คือฟาร์มที่เราพบหลักฐานว่าออกใบเพ็ดดีกรี (Pedigree) ให้น้องได้',
  // We can check for a pedigree, not each litter's health checks, so we say so plainly.
  scope:
    'ป้าย "มีใบเพ็ดดีกรี" หมายถึงเราพบหลักฐานว่าฟาร์มออกใบเพ็ดดีกรีได้ ฟาร์มที่ไม่มีป้ายอาจออกได้แต่เรายังยืนยันไม่ได้ และเราไม่ได้รับรองสุขภาพของพ่อแม่พันธุ์หรือลูกสุนัข',
  buyerChecks: [
    'ผลตรวจสะโพกและข้อศอกของพ่อแม่พันธุ์',
    'ผลตรวจตาของพ่อแม่พันธุ์',
    'ผลตรวจ DNA โรคทางพันธุกรรมตามสายพันธุ์',
    'สมุดวัคซีนของลูกสุนัข',
  ],
}

export const forceFreeDefinition =
  'ไม่ใช้ความเจ็บ ความอึดอัด หรือความกลัว เพื่อหยุดพฤติกรรม หรือเพื่อบังคับให้หมาทำตาม ไม่ว่าจะผ่านอุปกรณ์ มือ เสียง หรือวิธีอื่นใด'
