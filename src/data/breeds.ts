import { breedPhotos } from './breed-photos.generated'

export type Breed = { slug: string; name: string; nameEn: string }

/** A breed's photo in public/breeds/, if we have one (credits in breed-photos.generated). */
export function breedPhoto(slug: string): string | undefined {
  return breedPhotos[slug] ? `/breeds/${slug}.webp` : undefined
}

// Breeds a farm can be listed under. The public /farm page only shows breeds
// that have at least one farm, so adding a breed here costs nothing until it's used.
// Slugs are URLs (/farm/<slug>): never rename one once a farm uses it.
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
  { slug: 'thai-bangkaew', name: 'บางแก้ว', nameEn: 'Thai Bangkaew' },
  { slug: 'french-bulldog', name: 'เฟรนช์ บูลด็อก', nameEn: 'French Bulldog' },
  { slug: 'english-bulldog', name: 'อิงลิช บูลด็อก', nameEn: 'English Bulldog' },
  { slug: 'pug', name: 'ปั๊ก', nameEn: 'Pug' },
  { slug: 'chihuahua', name: 'ชิวาวา', nameEn: 'Chihuahua' },
  { slug: 'shih-tzu', name: 'ชิสุ', nameEn: 'Shih Tzu' },
  { slug: 'maltese', name: 'มอลทีส', nameEn: 'Maltese' },
  { slug: 'yorkshire-terrier', name: 'ยอร์กเชียร์ เทอร์เรีย', nameEn: 'Yorkshire Terrier' },
  { slug: 'bichon-frise', name: 'บิชอง ฟริเซ่', nameEn: 'Bichon Frisé' },
  { slug: 'dachshund', name: 'ดัชชุน', nameEn: 'Dachshund' },
  { slug: 'beagle', name: 'บีเกิ้ล', nameEn: 'Beagle' },
  { slug: 'miniature-schnauzer', name: 'มินิเอเจอร์ ชนาวเซอร์', nameEn: 'Miniature Schnauzer' },
  { slug: 'jack-russell-terrier', name: 'แจ็ค รัสเซลล์ เทอร์เรีย', nameEn: 'Jack Russell Terrier' },
  {
    slug: 'cavalier-king-charles-spaniel',
    name: 'คาวาเลียร์ คิง ชาร์ลส์ สแปเนียล',
    nameEn: 'Cavalier King Charles Spaniel',
  },
  { slug: 'cocker-spaniel', name: 'ค็อกเกอร์ สแปเนียล', nameEn: 'Cocker Spaniel' },
  { slug: 'papillon', name: 'ปาปิยอง', nameEn: 'Papillon' },
  { slug: 'pekingese', name: 'ปักกิ่ง', nameEn: 'Pekingese' },
  { slug: 'lhasa-apso', name: 'ลาซา แอปโซ', nameEn: 'Lhasa Apso' },
  { slug: 'japanese-spitz', name: 'เจแปนนีส สปิตซ์', nameEn: 'Japanese Spitz' },
  { slug: 'akita-inu', name: 'อะคิตะ อินุ', nameEn: 'Akita Inu' },
  { slug: 'siberian-husky', name: 'ไซบีเรียน ฮัสกี้', nameEn: 'Siberian Husky' },
  { slug: 'alaskan-malamute', name: 'อลาสกัน มาลามิวท์', nameEn: 'Alaskan Malamute' },
  { slug: 'chow-chow', name: 'เชาเชา', nameEn: 'Chow Chow' },
  { slug: 'german-shepherd', name: 'เยอรมัน เชพเพิร์ด', nameEn: 'German Shepherd' },
  { slug: 'belgian-malinois', name: 'เบลเจียน มาลินัวส์', nameEn: 'Belgian Malinois' },
  { slug: 'australian-shepherd', name: 'ออสเตรเลียน เชพเพิร์ด', nameEn: 'Australian Shepherd' },
  {
    slug: 'miniature-american-shepherd',
    name: 'มินิเอเจอร์ อเมริกัน เชพเพิร์ด',
    nameEn: 'Miniature American Shepherd',
  },
  { slug: 'rough-collie', name: 'รัฟ คอลลี่', nameEn: 'Rough Collie' },
  { slug: 'old-english-sheepdog', name: 'โอลด์ อิงลิช ชีพด็อก', nameEn: 'Old English Sheepdog' },
  { slug: 'cardigan-welsh-corgi', name: 'เวลช์ คอร์กี้ คาร์ดิแกน', nameEn: 'Cardigan Welsh Corgi' },
  { slug: 'bernese-mountain-dog', name: 'เบอร์นีส เมาน์เทน ด็อก', nameEn: 'Bernese Mountain Dog' },
  { slug: 'great-pyrenees', name: 'เกรท พีเรนีส', nameEn: 'Great Pyrenees' },
  { slug: 'saint-bernard', name: 'เซนต์ เบอร์นาร์ด', nameEn: 'Saint Bernard' },
  { slug: 'great-dane', name: 'เกรท เดน', nameEn: 'Great Dane' },
  { slug: 'rottweiler', name: 'ร็อตไวเลอร์', nameEn: 'Rottweiler' },
  { slug: 'doberman', name: 'โดเบอร์แมน', nameEn: 'Dobermann' },
  { slug: 'boxer', name: 'บ็อกเซอร์', nameEn: 'Boxer' },
  { slug: 'cane-corso', name: 'เคน คอร์โซ', nameEn: 'Cane Corso' },
  { slug: 'american-bully', name: 'อเมริกัน บูลลี่', nameEn: 'American Bully' },
  {
    slug: 'american-pit-bull-terrier',
    name: 'อเมริกัน พิทบูล เทอร์เรีย',
    nameEn: 'American Pit Bull Terrier',
  },
  { slug: 'bull-terrier', name: 'บูล เทอร์เรีย', nameEn: 'Bull Terrier' },
  { slug: 'dalmatian', name: 'ดัลเมเชียน', nameEn: 'Dalmatian' },
  { slug: 'weimaraner', name: 'ไวมาราเนอร์', nameEn: 'Weimaraner' },
  { slug: 'standard-schnauzer', name: 'สแตนดาร์ด ชนาวเซอร์', nameEn: 'Standard Schnauzer' },
  { slug: 'whippet', name: 'วิปเพ็ต', nameEn: 'Whippet' },
  { slug: 'italian-greyhound', name: 'อิตาเลียน เกรย์ฮาวด์', nameEn: 'Italian Greyhound' },
  { slug: 'basenji', name: 'บาเซนจิ', nameEn: 'Basenji' },
  { slug: 'shar-pei', name: 'ชาร์เป่ย', nameEn: 'Shar Pei' },
  { slug: 'boston-terrier', name: 'บอสตัน เทอร์เรีย', nameEn: 'Boston Terrier' },
  {
    slug: 'west-highland-white-terrier',
    name: 'เวสต์ ไฮแลนด์ ไวท์ เทอร์เรีย',
    nameEn: 'West Highland White Terrier',
  },
]

export function getBreed(slug: string): Breed | undefined {
  return breeds.find((b) => b.slug === slug)
}
