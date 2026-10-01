import type { MetadataRoute } from 'next'
import { areaCategories } from '@/data/categories'
import { findArea } from '@/data/areas'
import { breedsWithFarms, listIndexEntries, type IndexEntry } from '@/lib/places'
import { absoluteUrl } from '@/lib/site'

// Rebuilt hourly; admin saves also revalidate the whole site.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A database outage must not fail the deploy; serve the static pages until the next rebuild.
  let entries: IndexEntry[] = []
  let farmBreeds: { slug: string }[] = []
  try {
    ;[entries, farmBreeds] = await Promise.all([listIndexEntries(), breedsWithFarms()])
  } catch (e) {
    console.error('sitemap: could not load places', e)
  }
  const latest = (list: { updatedAt: string }[]) =>
    list.reduce<string | undefined>((max, e) => (!max || e.updatedAt > max ? e.updatedAt : max), undefined)

  const urls: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: latest(entries), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/criteria'), changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/farm'), changeFrequency: 'weekly', priority: 0.7 },
  ]

  for (const b of farmBreeds) {
    urls.push({ url: absoluteUrl(`/farm/${b.slug}`), changeFrequency: 'weekly', priority: 0.6 })
  }

  // Category pages, and area pages only where there is something to show.
  for (const c of areaCategories) {
    const inCat = entries.filter((e) => e.categories.includes(c.slug))
    urls.push({
      url: absoluteUrl(`/${c.slug}`),
      lastModified: latest(inCat),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
    const areas = new Map<string, typeof inCat>()
    for (const e of inCat) {
      for (const path of [e.province, e.district && `${e.province}/${e.district}`]) {
        if (!path || !findArea(...path.split('/'))) continue
        areas.set(path, [...(areas.get(path) ?? []), e])
      }
    }
    for (const [path, list] of areas) {
      urls.push({
        url: absoluteUrl(`/${c.slug}/${path}`),
        lastModified: latest(list),
        changeFrequency: 'weekly',
        priority: path.includes('/') ? 0.7 : 0.6,
      })
    }
  }

  for (const e of entries) {
    urls.push({
      url: absoluteUrl(`/place/${e.slug}`),
      lastModified: e.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }
  return urls
}
