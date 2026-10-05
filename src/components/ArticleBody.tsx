import Link from 'next/link'
import type { Place } from '@/data/places'
import { parseBody, type Inline } from '@/lib/article-body'
import { getPlace } from '@/lib/places'
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

/** Renders an article body; [[place:slug]] lines become the place's card (hidden if unpublished). */
export async function ArticleBody({ body }: { body: string }) {
  const blocks = parseBody(body)
  const slugs = blocks.flatMap((b) => (b.kind === 'place' ? [b.slug] : []))
  const places = new Map<string, Place>()
  for (const p of await Promise.all(slugs.map((s) => getPlace(s)))) if (p) places.set(p.slug, p)

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
        }
      })}
    </div>
  )
}
