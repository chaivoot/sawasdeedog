import Link from 'next/link'
import { areaName, areaPath, findArea } from '@/data/areas'
import { getCategory } from '@/data/categories'
import type { Place } from '@/data/places'
import { parseBody, type Block, type Inline } from '@/lib/article-body'
import { getPlace, randomPlaces } from '@/lib/places'
import { ListingCard } from './ListingCard'

function Text({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) =>
        p.href ? (
          p.href.startsWith('/') ? (
            <Link key={i} href={p.href}>
              {p.text}
            </Link>
          ) : (
            <a key={i} href={p.href} target="_blank" rel="noopener noreferrer">
              {p.text}
            </a>
          )
        ) : p.bold ? (
          <strong key={i}>{p.text}</strong>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  )
}

type RandomPick = { places: Place[]; href: string; label: string }

/**
 * A random block's cards and its "see all" link; nothing for an unknown category or area.
 * Farms are browsed by breed, not area, so they have no random block.
 */
async function pickRandom(
  b: Extract<Block, { kind: 'places' }>,
  exclude: string[],
): Promise<RandomPick | undefined> {
  const category = getCategory(b.category)
  if (!category || category.slug === 'farm') return undefined
  const area = b.province ? findArea(b.province, b.district) : undefined
  if (b.province && !area) return undefined
  const places = await randomPlaces({ category: category.slug, area }, b.count, exclude)
  const noun = category.listTitle ?? category.name
  return {
    places,
    href: `/${category.slug}${areaPath(area)}`,
    label: area ? `ดู${noun}ทั้งหมดใน${areaName(area)}` : `ดู${noun}ทั้งหมด`,
  }
}

/**
 * Renders an article body. [[place:slug]] lines become the place's card (hidden if unpublished);
 * [[places:…]] lines become a few random places from a category, never repeating one already shown.
 */
export async function ArticleBody({ body }: { body: string }) {
  const blocks = parseBody(body)
  const slugs = blocks.flatMap((b) => (b.kind === 'place' ? [b.slug] : []))
  const places = new Map<string, Place>()
  for (const p of await Promise.all(slugs.map((s) => getPlace(s)))) if (p) places.set(p.slug, p)
  // In order, so a later random block skips the places an earlier one picked.
  const picks = new Map<number, RandomPick>()
  const shown = [...slugs]
  for (const [i, b] of blocks.entries()) {
    if (b.kind !== 'places') continue
    const pick = await pickRandom(b, shown)
    if (!pick) continue
    picks.set(i, pick)
    shown.push(...pick.places.map((p) => p.slug))
  }

  return (
    <div className="article-body">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'h2':
            return <h2 key={i}>{b.text}</h2>
          case 'h3':
            return <h3 key={i}>{b.text}</h3>
          case 'p':
            return (
              <p key={i}>
                <Text parts={b.parts} />
              </p>
            )
          case 'list':
            return (
              <ul key={i}>
                {b.items.map((item, j) => (
                  <li key={j}>
                    <Text parts={item} />
                  </li>
                ))}
              </ul>
            )
          case 'image':
            return (
              <figure key={i} className="article-body__image">
                {/* eslint-disable-next-line @next/next/no-img-element -- uploaded article photos */}
                <img src={b.src} alt={b.alt} loading="lazy" />
                {b.alt && <figcaption>{b.alt}</figcaption>}
              </figure>
            )
          case 'place': {
            const place = places.get(b.slug)
            return place ? (
              <div key={i} className="article-body__place">
                <ListingCard place={place} />
              </div>
            ) : null
          }
          case 'places': {
            const pick = picks.get(i)
            if (!pick?.places.length) return null
            return (
              <div key={i} className="article-body__places">
                {pick.places.map((p) => (
                  <div key={p.slug} className="article-body__place">
                    <ListingCard place={p} />
                  </div>
                ))}
                <Link href={pick.href} className="article-body__more">
                  {pick.label} →
                </Link>
              </div>
            )
          }
        }
      })}
    </div>
  )
}
