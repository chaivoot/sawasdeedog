// Article bodies are plain text with a little markup, so the team can write them in a
// textarea (or paste them as JSON) and nothing they type is ever run as HTML:
//   ## Heading / ### Subheading   - list item   ![alt](image url)   [[place:slug]]
//   **bold** and [link text](url) inside paragraphs and list items.
// Blocks are separated by a blank line.

export type Inline = { text: string; bold?: boolean; href?: string }

export type Block =
  | { kind: 'h2' | 'h3'; text: string }
  | { kind: 'p'; parts: Inline[] }
  | { kind: 'list'; items: Inline[][] }
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'place'; slug: string }

const PLACE_RE = /^\[\[place:([a-z0-9]+(?:-[a-z0-9]+)*)\]\]$/
const IMAGE_RE = /^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/

/** **bold** and [text](url) runs; anything else is plain text. */
export function parseInline(s: string): Inline[] {
  const out: Inline[] = []
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]*)\)/g
  let last = 0
  for (let m = re.exec(s); m; m = re.exec(s)) {
    if (m.index > last) out.push({ text: s.slice(last, m.index) })
    out.push(m[1] != null ? { text: m[1], bold: true } : { text: m[2], href: m[3] })
    last = re.lastIndex
  }
  if (last < s.length) out.push({ text: s.slice(last) })
  return out
}

export function parseBody(body: string): Block[] {
  const blocks: Block[] = []
  for (const chunk of body.replace(/\r\n?/g, '\n').split(/\n\s*\n/)) {
    const lines = chunk
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) continue
    // A run of special lines (images, places) inside one chunk each become their own block.
    if (lines.every((l) => PLACE_RE.test(l) || IMAGE_RE.test(l))) {
      for (const l of lines) {
        const place = l.match(PLACE_RE)
        const image = l.match(IMAGE_RE)
        if (place) blocks.push({ kind: 'place', slug: place[1] })
        else if (image) blocks.push({ kind: 'image', alt: image[1], src: image[2] })
      }
      continue
    }
    const first = lines[0]
    if (lines.length === 1 && first.startsWith('### '))
      blocks.push({ kind: 'h3', text: first.slice(4).trim() })
    else if (lines.length === 1 && first.startsWith('## '))
      blocks.push({ kind: 'h2', text: first.slice(3).trim() })
    else if (lines.every((l) => /^[-•*]\s+/.test(l)))
      blocks.push({ kind: 'list', items: lines.map((l) => parseInline(l.replace(/^[-•*]\s+/, ''))) })
    else blocks.push({ kind: 'p', parts: parseInline(lines.join(' ')) })
  }
  return blocks
}

/** Places an article shows as cards. */
export function placeSlugsIn(body: string): string[] {
  return parseBody(body).flatMap((b) => (b.kind === 'place' ? [b.slug] : []))
}

/** Images an article's body shows. */
export function imageUrlsIn(body: string): string[] {
  return parseBody(body).flatMap((b) => (b.kind === 'image' ? [b.src] : []))
}

/** Plain-text length, for a reading-time estimate. */
export function readingMinutes(body: string): number {
  const chars = body.replace(/!\[[^\]]*\]\([^)]*\)|\[\[place:[^\]]*\]\]|[#*\-[\]()]/g, '').length
  // Thai reads at roughly 500–600 characters a minute.
  return Math.max(1, Math.round(chars / 550))
}
