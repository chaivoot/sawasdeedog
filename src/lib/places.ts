import { categories, type TrainerStyle } from '@/data/categories'
import { breeds, type Breed } from '@/data/breeds'
import { places, type Place } from '@/data/places'
import { sponsors, type Sponsor } from '@/data/sponsors'
import type { Area } from '@/data/areas'

// Data access lives here so the sample arrays can later be swapped for a
// database or CMS without touching the pages.

export type PlaceQuery = {
  category: string
  area?: Area
  type?: string
  trainerStyle?: TrainerStyle
  filters?: string[]
}

export function listPlaces(q: PlaceQuery): Place[] {
  return places
    .filter((p) => p.category === q.category)
    .filter((p) => !q.area || p.province === q.area.province.slug)
    .filter((p) => !q.area?.district || p.district === q.area.district.slug)
    .filter((p) => !q.type || p.type === q.type)
    .filter((p) => !q.trainerStyle || p.trainerStyle === q.trainerStyle)
    .filter((p) => (q.filters ?? []).every((f) => p.attributes.includes(f)))
    .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))
}

export function getPlace(slug: string): Place | undefined {
  return places.find((p) => p.slug === slug)
}

export function allPlaceSlugs(): string[] {
  return places.map((p) => p.slug)
}

export type BreedWithCount = Breed & { farmCount: number }

/** Breeds that have at least one farm, in the curated order of data/breeds. */
export function breedsWithFarms(): BreedWithCount[] {
  return breeds.map((b) => ({ ...b, farmCount: farmsForBreed(b.slug).length })).filter((b) => b.farmCount > 0)
}

export function farmsForBreed(breed: string): Place[] {
  return places
    .filter((p) => p.category === 'farm' && p.breeds?.includes(breed))
    .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))
}

export function activeSponsor(today: string): Sponsor | undefined {
  return sponsors.find(
    (s) => s.from <= today && today <= s.to && categories.some((c) => c.slug === s.category),
  )
}
