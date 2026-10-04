import type { TrainerStyle } from './categories'

export type Contacts = {
  phone?: string
  line?: string
  instagram?: string
  facebook?: string
  website?: string
}

export type Place = {
  /** Database id; absent on the built-in sample data. */
  id?: string
  slug: string
  name: string
  /** Main category: breadcrumb, structured data and the place's own page. */
  category: string
  /** Other categories the place also passes the criteria for (never farm). */
  extraCategories?: string[]
  /** One of the main category's `types` slugs. */
  type?: string
  /** Trainers only. */
  trainerStyle?: TrainerStyle
  province: string
  district?: string
  /** ISO date of the team's last check. */
  checkedAt: string
  description?: string
  /** Filter slugs, from any of the place's categories, that this place meets. */
  attributes: string[]
  hours?: string
  price?: string
  contacts: Contacts
  /** Storefront on Google Maps; absent for services without one (visiting trainers, sitters). */
  mapsUrl?: string
  /** Storefront coordinates, read from the Google Maps link. */
  lat?: number
  lng?: number
  /** Stays: heaviest dog taken, in kg; unset means no limit. */
  maxDogKg?: number
  /** Stays: most dogs per room; unset means not limited (or not known). */
  maxDogs?: number
  /** Where the place goes to customers: "bangkok" (whole province) or "bangkok/lat-krabang". */
  serviceAreas?: string[]
  photos: string[]
  /** Farms only: breed slugs. */
  breeds?: string[]
  /** Hidden from the site when false (admin only). */
  published?: boolean
  /** Categories this place is pinned in: shown first on those lists. */
  pinnedIn?: string[]
  /** User star ratings; absent when nobody has rated yet. */
  rating?: { count: number; avg: number }
}

/** Main category first, then the extras. */
export function placeCategories(p: Pick<Place, 'category' | 'extraCategories'>): string[] {
  return [p.category, ...(p.extraCategories ?? [])]
}

// Sample data mirroring the mockups. Used only when Supabase is not configured
// (local development); real listings live in the Supabase `places` table.
const sampleDescription =
  '[คำอธิบายจากทีม 2-4 บรรทัด เช่น บรรยากาศร้าน ขนาดหมาที่เหมาะ โซนที่หมานั่งได้ และสิ่งที่ควรรู้ก่อนไป]'
const sampleContacts: Contacts = {
  phone: '[เบอร์โทร]',
  line: '[LINE ID]',
  instagram: '[@ชื่อบัญชี]',
}
const maps = 'https://maps.google.com/'

export const samplePlaces: Place[] = [
  {
    slug: 'sample-stay-a',
    name: 'ที่พักตัวอย่าง A',
    category: 'stay',
    type: 'resort',
    province: 'chonburi',
    checkedAt: '2026-09-15',
    attributes: ['no-restaurant', 'no-pool'],
    maxDogKg: 25,
    maxDogs: 2,
    contacts: sampleContacts,
    mapsUrl: maps,
    photos: [],
  },
  {
    slug: 'sample-cafe-a',
    name: 'คาเฟ่ตัวอย่าง A',
    category: 'cafe',
    type: 'cafe',
    province: 'bangkok',
    district: 'lat-krabang',
    checkedAt: '2026-09-12',
    description: sampleDescription,
    attributes: ['dog-menu', 'parking'],
    hours: '[ข้อความอิสระจากทีม เช่น ทุกวัน 9:00-18:00 ปิดวันพุธ]',
    price: '[ข้อความอิสระจากทีม]',
    contacts: sampleContacts,
    mapsUrl: maps,
    lat: 13.7279,
    lng: 100.7782,
    photos: [],
  },
  {
    slug: 'sample-restaurant-b',
    name: 'ร้านอาหารตัวอย่าง B',
    category: 'cafe',
    type: 'restaurant',
    extraCategories: ['park'],
    province: 'bangkok',
    district: 'lat-krabang',
    checkedAt: '2026-08-20',
    attributes: ['parking', 'park:pool', 'paid'],
    contacts: { phone: '[เบอร์โทร]' },
    mapsUrl: maps,
    lat: 13.7225,
    lng: 100.7598,
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
    attributes: [],
    contacts: {},
    mapsUrl: maps,
    lat: 13.7302,
    lng: 100.7451,
    photos: [],
  },
  {
    slug: 'sample-cafe-d',
    name: 'คาเฟ่ตัวอย่าง D',
    category: 'cafe',
    type: 'cafe',
    pinnedIn: ['cafe'],
    province: 'bangkok',
    district: 'bang-na',
    checkedAt: '2026-09-02',
    attributes: ['parking'],
    contacts: {},
    mapsUrl: maps,
    lat: 13.6676,
    lng: 100.6045,
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
    serviceAreas: ['bangkok/lat-krabang', 'bangkok/bang-na', 'samut-prakan'],
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
    extraCategories: ['grooming'],
    type: 'hospital',
    province: 'bangkok',
    district: 'lat-krabang',
    checkedAt: '2026-09-01',
    attributes: ['open-24h'],
    contacts: { phone: '[เบอร์โทร]' },
    mapsUrl: maps,
    lat: 13.7243,
    lng: 100.7716,
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
