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
 * The Dog Friendly rule is about where dogs are welcome, so it applies to every
 * category except trainers (judged on training method) and farms (own criteria).
 */
export function hasDogFriendlyRule(categorySlug: string) {
  return categorySlug !== 'trainer' && categorySlug !== 'farm'
}

/** Farms are listed only if they can issue a pedigree certificate for the puppy. */
export const farmRule = {
  banner: 'ทุกฟาร์มในนี้ออกใบเพ็ดดีกรี (Pedigree) ให้น้องได้',
  criterion: 'ออกใบเพ็ดดีกรี (Pedigree) ให้น้องได้',
  // We can verify a pedigree, not each litter's health checks, so we say so plainly.
  scope: 'เราตรวจสอบเฉพาะว่าฟาร์มออกใบเพ็ดดีกรีได้ ไม่ได้รับรองสุขภาพของพ่อแม่พันธุ์หรือลูกสุนัข',
  buyerChecks: [
    'ผลตรวจสะโพกและข้อศอกของพ่อแม่พันธุ์',
    'ผลตรวจตาของพ่อแม่พันธุ์',
    'ผลตรวจ DNA โรคทางพันธุกรรมตามสายพันธุ์',
    'สมุดวัคซีนของลูกสุนัข',
  ],
}

export const forceFreeDefinition =
  'ไม่ใช้ความเจ็บ ความอึดอัด หรือความกลัว เพื่อหยุดพฤติกรรม หรือเพื่อบังคับให้หมาทำตาม ไม่ว่าจะผ่านอุปกรณ์ มือ เสียง หรือวิธีอื่นใด'
