import Link from 'next/link'
import { Fragment } from 'react'

export type Crumb = { label: string; href?: string }

/** Desktop only (hidden on mobile by CSS); mobile uses the header back arrow. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb" className="breadcrumb">
      {items.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span className="sep" aria-hidden="true">
              ›
            </span>
          )}
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </Fragment>
      ))}
    </nav>
  )
}
