export type Breed = { slug: string; name: string; nameEn: string }

// TODO(data): extend with every breed the team accepts farms for.
export const breeds: Breed[] = [
  { slug: 'golden-retriever', name: 'โกลเด้น รีทรีฟเวอร์', nameEn: 'Golden Retriever' },
  { slug: 'labrador-retriever', name: 'ลาบราดอร์ รีทรีฟเวอร์', nameEn: 'Labrador Retriever' },
  { slug: 'shetland-sheepdog', name: 'เชตแลนด์ ชีพด็อก', nameEn: 'Shetland Sheepdog' },
  { slug: 'shiba-inu', name: 'ชิบะ อินุ', nameEn: 'Shiba Inu' },
  { slug: 'pembroke-welsh-corgi', name: 'เวลช์ คอร์กี้ เพมโบรก', nameEn: 'Pembroke Welsh Corgi' },
  { slug: 'poodle', name: 'พุดเดิ้ล', nameEn: 'Poodle' },
  { slug: 'thai-ridgeback', name: 'ไทยหลังอาน', nameEn: 'Thai Ridgeback' },
  { slug: 'border-collie', name: 'บอร์เดอร์ คอลลี่', nameEn: 'Border Collie' },
  { slug: 'pomeranian', name: 'ปอมเมอเรเนียน', nameEn: 'Pomeranian' },
  { slug: 'samoyed', name: 'ซามอยด์', nameEn: 'Samoyed' },
]

export function getBreed(slug: string): Breed | undefined {
  return breeds.find((b) => b.slug === slug)
}
