import type { TrainerStyle } from './categories'

export type Contacts = {
  phone?: string
  line?: string
  instagram?: string
  facebook?: string
  website?: string
}

export type Place = {
  slug: string
  name: string
  category: string
  /** One of the category's `types` slugs. */
  type?: string
  /** Trainers only. */
  trainerStyle?: TrainerStyle
  province: string
  district?: string
  /** ISO date of the team's last check. */
  checkedAt: string
  description?: string
  /** Filter slugs from the category this place meets. */
  attributes: string[]
  hours?: string
  price?: string
  contacts: Contacts
  mapsUrl: string
  photos: string[]
  /** Farms only: breed slugs. */
  breeds?: string[]
}

// TODO(data): everything below is sample data mirroring the mockups. Replace
// with the team's real listings (or swap the functions in lib/places.ts for a
// database/CMS query).
const sampleDescription =
  '[คำอธิบายจากทีม 2-4 บรรทัด เช่น บรรยากาศร้าน ขนาดหมาที่เหมาะ โซนที่หมานั่งได้ และสิ่งที่ควรรู้ก่อนไป]'
const sampleContacts: Contacts = {
  phone: '[เบอร์โทร]',
  line: '[LINE ID]',
  instagram: '[@ชื่อบัญชี]',
}
const maps = 'https://maps.google.com/'

export const places: Place[] = [
  {
    slug: 'sample-cafe-a',
    name: 'คาเฟ่ตัวอย่าง A',
    category: 'cafe',
    type: 'cafe',
    province: 'bangkok',
    district: 'lat-krabang',
    checkedAt: '2026-09-12',
    description: sampleDescription,
    attributes: ['large-dog', 'dog-menu', 'parking'],
    hours: '[ข้อความอิสระจากทีม เช่น ทุกวัน 9:00-18:00 ปิดวันพุธ]',
    price: '[ข้อความอิสระจากทีม]',
    contacts: sampleContacts,
    mapsUrl: maps,
    photos: [],
  },
  {
    slug: 'sample-restaurant-b',
    name: 'ร้านอาหารตัวอย่าง B',
    category: 'cafe',
    type: 'restaurant',
    province: 'bangkok',
    district: 'lat-krabang',
    checkedAt: '2026-08-20',
    attributes: ['large-dog', 'parking'],
    contacts: { phone: '[เบอร์โทร]' },
    mapsUrl: maps,
    photos: [],
  },
  {
    slug: 'sample-cafe-c',
    name: 'คาเฟ่ตัวอย่าง C',
    category: 'cafe',
    type: 'cafe',
    province: 'bangkok',
    district: 'lat-krabang',
    checkedAt: '2026-07-05',
    attributes: ['large-dog'],
    contacts: {},
    mapsUrl: maps,
    photos: [],
  },
  {
    slug: 'sample-cafe-d',
    name: 'คาเฟ่ตัวอย่าง D',
    category: 'cafe',
    type: 'cafe',
    province: 'bangkok',
    district: 'bang-na',
    checkedAt: '2026-09-02',
    attributes: ['large-dog', 'parking'],
    contacts: {},
    mapsUrl: maps,
    photos: [],
  },
  {
    slug: 'sample-trainer-a',
    name: 'ครูฝึกตัวอย่าง A',
    category: 'trainer',
    trainerStyle: 'rplus',
    province: 'bangkok',
    district: 'lat-krabang',
    checkedAt: '2026-09-10',
    attributes: ['home-visit', 'online'],
    contacts: sampleContacts,
    mapsUrl: maps,
    photos: [],
  },
  {
    slug: 'sample-trainer-b',
    name: 'ครูฝึกตัวอย่าง B',
    category: 'trainer',
    trainerStyle: 'rplus',
    province: 'bangkok',
    district: 'lat-krabang',
    checkedAt: '2026-09-08',
    attributes: ['day-school', 'group-class'],
    contacts: {},
    mapsUrl: maps,
    photos: [],
  },
  {
    slug: 'sample-trainer-c',
    name: 'ครูฝึกตัวอย่าง C',
    category: 'trainer',
    trainerStyle: 'balance',
    province: 'bangkok',
    district: 'lat-krabang',
    checkedAt: '2026-09-03',
    attributes: ['home-visit'],
    contacts: {},
    mapsUrl: maps,
    photos: [],
  },
  {
    slug: 'sample-vet-a',
    name: 'โรงพยาบาลสัตว์ตัวอย่าง A',
    category: 'vet',
    type: 'hospital',
    province: 'bangkok',
    district: 'lat-krabang',
    checkedAt: '2026-09-01',
    attributes: ['open-24h'],
    contacts: { phone: '[เบอร์โทร]' },
    mapsUrl: maps,
    photos: [],
  },
  {
    slug: 'sample-farm-a',
    name: 'ฟาร์มตัวอย่าง A',
    category: 'farm',
    province: 'nakhon-pathom',
    checkedAt: '2026-09-15',
    attributes: [],
    contacts: sampleContacts,
    mapsUrl: maps,
    photos: [],
    breeds: ['shetland-sheepdog', 'border-collie'],
  },
  {
    slug: 'sample-farm-b',
    name: 'ฟาร์มตัวอย่าง B',
    category: 'farm',
    province: 'chiang-mai',
    checkedAt: '2026-09-11',
    attributes: [],
    contacts: {},
    mapsUrl: maps,
    photos: [],
    breeds: ['shetland-sheepdog'],
  },
  {
    slug: 'sample-farm-c',
    name: 'ฟาร์มตัวอย่าง C',
    category: 'farm',
    province: 'chonburi',
    checkedAt: '2026-09-04',
    attributes: [],
    contacts: {},
    mapsUrl: maps,
    photos: [],
    breeds: ['shetland-sheepdog', 'poodle'],
  },
  {
    slug: 'sample-farm-d',
    name: 'ฟาร์มตัวอย่าง D',
    category: 'farm',
    province: 'nakhon-pathom',
    checkedAt: '2026-08-28',
    attributes: [],
    contacts: {},
    mapsUrl: maps,
    photos: [],
    breeds: ['golden-retriever', 'labrador-retriever'],
  },
]
