// Groups on the "หมาเราต้องมี" page (/shopping), in page order.
export type ProductGroup = { slug: string; name: string; blurb: string }

export const productGroups: ProductGroup[] = [
  { slug: 'walk', name: 'เดินเล่น & ฝึก', blurb: 'สายรัดอก สายจูง และอุปกรณ์ฝึกแบบ Force-Free' },
  { slug: 'food', name: 'อาหาร & ขนม', blurb: 'อาหาร และขนมสำหรับให้รางวัลตอนฝึก' },
  { slug: 'travel', name: 'พาน้องไปเที่ยว', blurb: 'ขึ้นรถ ไปทะเล ไปค้างคืน' },
  { slug: 'home', name: 'ในบ้าน & ของเล่น', blurb: 'ที่นอน ชาม และของเล่นฝึกสมอง' },
  { slug: 'care', name: 'อาบน้ำ & ดูแล', blurb: 'แปรง แชมพู และของดูแลประจำวัน' },
]

export const getProductGroup = (slug: string) => productGroups.find((g) => g.slug === slug)
