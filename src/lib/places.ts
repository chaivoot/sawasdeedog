import 'server-only'
import { categories, type TrainerStyle } from '@/data/categories'
import { breeds, type Breed } from '@/data/breeds'
import { samplePlaces, type Place } from '@/data/places'
import { sponsors, type Sponsor } from '@/data/sponsors'
import type { Area } from '@/data/areas'
import { ratingStats } from './ratings'
import { db, isSupabaseConfigured } from './supabase'

// All reads of listings go through here. With Supabase configured they come
// from the `places` table; otherwise from the built-in sample data.

export type PlaceRow = {
  id: string
  slug: string
  name: string
  category: string
  type: string | null
  trainer_style: TrainerStyle | null
  province: string
  district: string | null
  checked_at: string
  description: string | null
  attributes: string[]
  hours: string | null
  price: string | null
  phone: string | null
  line: string | null
  instagram: string | null
  facebook: string | null
  website: string | null
  maps_url: string
  photos: string[]
  breeds: string[]
  published: boolean
}

export function rowToPlace(r: PlaceRow): Place {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    type: r.type ?? undefined,
    trainerStyle: r.trainer_style ?? undefined,
    province: r.province,
    district: r.district ?? undefined,
    checkedAt: r.checked_at,
    description: r.description ?? undefined,
    attributes: r.attributes ?? [],
    hours: r.hours ?? undefined,
    price: r.price ?? undefined,
    contacts: {
      phone: r.phone ?? undefined,
      line: r.line ?? undefined,
      instagram: r.instagram ?? undefined,
      facebook: r.facebook ?? undefined,
      website: r.website ?? undefined,
    },
    mapsUrl: r.maps_url,
    photos: r.photos ?? [],
    breeds: r.breeds ?? [],
    published: r.published,
  }
}

/** Attaches rating stats to places that came from the database. */
async function withRatings(places: Place[]): Promise<Place[]> {
  const ids = places.map((p) => p.id).filter((id): id is string => Boolean(id))
  const stats = await ratingStats(ids)
  return places.map((p) => (p.id && stats.has(p.id) ? { ...p, rating: stats.get(p.id) } : p))
}

const byChecked = (a: Place, b: Place) => b.checkedAt.localeCompare(a.checkedAt)

export type PlaceQuery = {
  category: string
  area?: Area
  type?: string
  trainerStyle?: TrainerStyle
  filters?: string[]
}

export async function listPlaces(q: PlaceQuery): Promise<Place[]> {
  if (!isSupabaseConfigured()) {
    return samplePlaces
      .filter((p) => p.category === q.category)
      .filter((p) => !q.area || p.province === q.area.province.slug)
      .filter((p) => !q.area?.district || p.district === q.area.district.slug)
      .filter((p) => !q.type || p.type === q.type)
      .filter((p) => !q.trainerStyle || p.trainerStyle === q.trainerStyle)
      .filter((p) => (q.filters ?? []).every((f) => p.attributes.includes(f)))
      .sort(byChecked)
  }
  let query = db().from('places').select('*').eq('published', true).eq('category', q.category)
  if (q.area) query = query.eq('province', q.area.province.slug)
  if (q.area?.district) query = query.eq('district', q.area.district.slug)
  if (q.type) query = query.eq('type', q.type)
  if (q.trainerStyle) query = query.eq('trainer_style', q.trainerStyle)
  if (q.filters?.length) query = query.contains('attributes', q.filters)
  const { data, error } = await query.order('checked_at', { ascending: false })
  if (error) throw error
  return withRatings((data as PlaceRow[]).map(rowToPlace))
}

/** Published place by slug (public pages). */
export async function getPlace(slug: string): Promise<Place | undefined> {
  if (!isSupabaseConfigured()) return samplePlaces.find((p) => p.slug === slug)
  const { data, error } = await db()
    .from('places')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  if (error) throw error
  if (!data) return undefined
  const [place] = await withRatings([rowToPlace(data as PlaceRow)])
  return place
}

export type BreedWithCount = Breed & { farmCount: number }

async function farms(): Promise<Place[]> {
  if (!isSupabaseConfigured()) return samplePlaces.filter((p) => p.category === 'farm')
  const { data, error } = await db().from('places').select('*').eq('published', true).eq('category', 'farm')
  if (error) throw error
  return (data as PlaceRow[]).map(rowToPlace)
}

/** Breeds that have at least one farm, in the curated order of data/breeds. */
export async function breedsWithFarms(): Promise<BreedWithCount[]> {
  const all = await farms()
  return breeds
    .map((b) => ({ ...b, farmCount: all.filter((f) => f.breeds?.includes(b.slug)).length }))
    .filter((b) => b.farmCount > 0)
}

export async function farmsForBreed(breed: string): Promise<Place[]> {
  return withRatings((await farms()).filter((f) => f.breeds?.includes(breed)).sort(byChecked))
}

export function activeSponsor(today: string): Sponsor | undefined {
  return sponsors.find(
    (s) => s.from <= today && today <= s.to && categories.some((c) => c.slug === s.category),
  )
}
