import 'server-only'
import { cache } from 'react'
import { categories, extraTypeToken, type TrainerStyle } from '@/data/categories'
import { breedsByName, type Breed } from '@/data/breeds'
import { placeCategories, samplePlaces, type Place } from '@/data/places'
import { sponsors, type Sponsor } from '@/data/sponsors'
import type { Area } from '@/data/areas'
import { coversArea, areaKeys } from './geo'
import { ratingStats } from './ratings'
import { db, isSupabaseConfigured } from './supabase'
import { todayInBangkok } from './format'

// All reads of listings go through here. With Supabase configured they come
// from the `places` table; otherwise from the built-in sample data.

export type PlaceRow = {
  id: string
  slug: string
  name: string
  category: string
  extra_categories: string[]
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
  maps_url: string | null
  service_areas: string[]
  lat: number | null
  lng: number | null
  max_dog_kg: number | null
  /** Added by 0011_agoda_url.sql. */
  agoda_url?: string | null
  max_dogs: number | null
  photos: string[]
  breeds: string[]
  published: boolean
  /** Added by 0006_pins.sql; missing before that migration runs. */
  pinned_in?: string[] | null
  /** Added by 0007_pinned_at.sql. */
  pinned_at?: string | null
}

export function rowToPlace(r: PlaceRow): Place {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    extraCategories: r.extra_categories ?? [],
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
    mapsUrl: r.maps_url ?? undefined,
    serviceAreas: r.service_areas ?? [],
    lat: r.lat ?? undefined,
    lng: r.lng ?? undefined,
    maxDogKg: r.max_dog_kg ?? undefined,
    agodaUrl: r.agoda_url ?? undefined,
    maxDogs: r.max_dogs ?? undefined,
    photos: r.photos ?? [],
    breeds: r.breeds ?? [],
    published: r.published,
    pinnedIn: r.pinned_in ?? [],
    pinnedAt: r.pinned_at ?? undefined,
  }
}

/** Attaches rating stats to places that came from the database. */
async function withRatings(places: Place[]): Promise<Place[]> {
  const ids = places.map((p) => p.id).filter((id): id is string => Boolean(id))
  const stats = await ratingStats(ids)
  return places.map((p) => (p.id && stats.has(p.id) ? { ...p, rating: stats.get(p.id) } : p))
}

/** FNV-1a: a small, stable string hash. */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/**
 * Listings in a fresh order each day, so no place stays at the top just for
 * being checked last. The order holds all day (going back to a list finds
 * things where they were) and is the same for everyone. Places pinned in the
 * category come first, the most recently pinned on top.
 */
function dailyOrder(places: Place[], category: string, day = todayInBangkok()): Place[] {
  return places
    .map((p) => ({ p, pinned: p.pinnedIn?.includes(category) ? 0 : 1, k: hash(`${day}:${p.slug}`) }))
    .sort((a, b) => a.pinned - b.pinned || (a.pinned === 0 ? byPinnedAt(a.p, b.p) : 0) || a.k - b.k)
    .map((x) => x.p)
}

/** Latest pin first; pins from before pin times were kept come last. */
export function byPinnedAt(a: Place, b: Place): number {
  return (b.pinnedAt ?? '').localeCompare(a.pinnedAt ?? '')
}

export type PlaceQuery = {
  category: string
  area?: Area
  type?: string
  trainerStyle?: TrainerStyle
  filters?: string[]
}

/** Is the place of this type within the given category (main or extra)? */
export function hasType(p: Place, category: string, type: string): boolean {
  return p.category === category ? p.type === type : p.attributes.includes(extraTypeToken(category, type))
}

async function listPlacesUncached(q: PlaceQuery): Promise<Place[]> {
  if (!isSupabaseConfigured()) {
    const places = samplePlaces
      .filter((p) => placeCategories(p).includes(q.category))
      .filter((p) => !q.area || coversArea(p, q.area))
      .filter((p) => !q.type || hasType(p, q.category, q.type))
      .filter((p) => !q.trainerStyle || p.trainerStyle === q.trainerStyle)
      .filter((p) => (q.filters ?? []).every((f) => p.attributes.includes(f)))
    return dailyOrder(places, q.category)
  }
  // Category slugs are fixed identifiers from data/categories, safe to put in the filter string.
  let query = db()
    .from('places')
    .select('*')
    .eq('published', true)
    .or(`category.eq.${q.category},extra_categories.cs.{${q.category}}`)
  // Area is matched below: a place shows up by its address or by its service areas.
  // The type column is the main category's; extra categories keep theirs in the attributes.
  if (q.type)
    query = query.or(
      `and(category.eq.${q.category},type.eq.${q.type}),attributes.cs.{"${extraTypeToken(q.category, q.type)}"}`,
    )
  if (q.trainerStyle) query = query.eq('trainer_style', q.trainerStyle)
  if (q.filters?.length) query = query.contains('attributes', q.filters)
  const { data, error } = await query
  if (error) throw error
  const places = (data as PlaceRow[]).map(rowToPlace).filter((p) => !q.area || coversArea(p, q.area))
  return withRatings(dailyOrder(places, q.category))
}

/** Cached per request so generateMetadata and the page share one query. */
export const listPlaces = cache(listPlacesUncached)

/** Every published place, unordered and without ratings (for counting). */
export const listAllPlaces = cache(async (): Promise<Place[]> => {
  if (!isSupabaseConfigured()) return samplePlaces
  const { data, error } = await db().from('places').select('*').eq('published', true)
  if (error) throw error
  return (data as PlaceRow[]).map(rowToPlace)
})

/** Published place by slug (public pages). Cached per request. */
export const getPlace = cache(getPlaceUncached)

async function getPlaceUncached(slug: string): Promise<Place | undefined> {
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

/** Breeds that have at least one farm, ก–ฮ by Thai name. */
export async function breedsWithFarms(): Promise<BreedWithCount[]> {
  const all = await farms()
  return breedsByName
    .map((b) => ({ ...b, farmCount: all.filter((f) => f.breeds?.includes(b.slug)).length }))
    .filter((b) => b.farmCount > 0)
}

export async function farmsForBreed(breed: string): Promise<Place[]> {
  return withRatings(
    dailyOrder(
      (await farms()).filter((f) => f.breeds?.includes(breed)),
      'farm',
    ),
  )
}

export function activeSponsor(today: string): Sponsor | undefined {
  return sponsors.find(
    (s) => s.from <= today && today <= s.to && categories.some((c) => c.slug === s.category),
  )
}

export type IndexEntry = {
  slug: string
  /** Every category the place is listed under, main first. */
  categories: string[]
  province: string
  district?: string
  serviceAreas: string[]
  updatedAt: string
}

/** Every published place, lightly, for the sitemap and area links. */
export const listIndexEntries = cache(async (): Promise<IndexEntry[]> => {
  if (!isSupabaseConfigured()) {
    return samplePlaces.map((p) => ({
      slug: p.slug,
      categories: placeCategories(p),
      province: p.province,
      district: p.district,
      serviceAreas: p.serviceAreas ?? [],
      updatedAt: p.checkedAt,
    }))
  }
  const { data, error } = await db()
    .from('places')
    .select('slug, category, extra_categories, province, district, service_areas, updated_at')
    .eq('published', true)
  if (error) throw error
  return (
    data as {
      slug: string
      category: string
      extra_categories: string[] | null
      province: string
      district: string | null
      service_areas: string[] | null
      updated_at: string
    }[]
  ).map((r) => ({
    slug: r.slug,
    categories: [r.category, ...(r.extra_categories ?? [])],
    province: r.province,
    district: r.district ?? undefined,
    serviceAreas: r.service_areas ?? [],
    updatedAt: r.updated_at,
  }))
})

export type AreaCount = { province: string; district?: string; count: number }

/** How many places a category has per district (and per province, district undefined). */
export async function areaCounts(category: string): Promise<AreaCount[]> {
  const entries = (await listIndexEntries()).filter((e) => e.categories.includes(category))
  const map = new Map<string, AreaCount>()
  for (const e of entries) {
    for (const k of areaKeys(e)) {
      const [province, district] = k.split('/')
      const c = map.get(k) ?? { province, district, count: 0 }
      c.count++
      map.set(k, c)
    }
  }
  return [...map.values()]
}
