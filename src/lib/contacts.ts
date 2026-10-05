import type { Contacts } from '@/data/places'

// Contacts are typed by hand in the admin: a handle, "@handle", or a full link
// copied from the app. These turn any of those into one canonical form.

function asUrl(v: string): URL | undefined {
  const s = v.trim()
  if (!s) return undefined
  try {
    return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : `https://${s}`)
  } catch {
    return undefined
  }
}

// Handles may contain dots (people.and.tail), so only a slash or a known domain means a link.
const looksLikeLink = (v: string) => /\/|(instagram|facebook|fb)\.(com|me)/i.test(v)

/** Instagram handle without "@", from "@name", "name" or an instagram.com link. */
export function instagramHandle(v?: string): string | undefined {
  if (!v?.trim()) return undefined
  if (!looksLikeLink(v)) return v.trim().replace(/^@/, '') || undefined
  const u = asUrl(v)
  if (!u || !/(^|\.)instagram\.com$/i.test(u.hostname)) return undefined
  return u.pathname.split('/').filter(Boolean)[0]
}

/**
 * https://www.facebook.com/<page> from a page name or any facebook link
 * (m., web., mbasic., fb.com, with tracking parameters). profile.php keeps its id.
 */
export function facebookUrl(v?: string): string | undefined {
  if (!v?.trim()) return undefined
  if (!looksLikeLink(v)) return `https://www.facebook.com/${encodeURIComponent(v.trim().replace(/^@/, ''))}`
  const u = asUrl(v)
  if (!u) return undefined
  if (/^fb\.me$/i.test(u.hostname)) return u.toString()
  if (!/(^|\.)(facebook\.com|fb\.com)$/i.test(u.hostname)) return undefined
  const path = u.pathname.replace(/\/+$/, '') || '/'
  const id = path === '/profile.php' ? u.searchParams.get('id') : null
  return `https://www.facebook.com${path}${id ? `?id=${id}` : ''}`
}

function decode(v: string): string {
  try {
    return decodeURIComponent(v)
  } catch {
    return v
  }
}

/**
 * What to show for a Facebook link: "facebook.com/peopleandtail" for a page; a post,
 * group or numeric profile link would be a long, unreadable URL, so it says "Facebook".
 */
export function facebookLabel(url: string): string {
  const u = asUrl(url)
  const parts = u?.pathname.split('/').filter(Boolean) ?? []
  if (parts.length === 1 && parts[0] !== 'profile.php' && !/^\d+$/.test(parts[0]))
    return `facebook.com/${decode(parts[0])}`
  return 'เปิดใน Facebook'
}

/** What to show for a website: the host and readable path, cut short when long. */
export function websiteLabel(url: string): string {
  const u = asUrl(url)
  if (!u) return url
  const host = u.hostname.replace(/^www\./, '')
  const path = decode(u.pathname).replace(/\/+$/, '')
  const full = host + path
  return full.length > 40 ? `${host}${path ? '/…' : ''}` : full
}

/** Link to open a LINE account: from "@official", a personal ID, or a line.me / lin.ee link. */
export function lineLink(v?: string): { href: string; label: string } | undefined {
  const s = v?.trim()
  if (!s) return undefined
  if (/^(https?:\/\/)?(line\.me|lin\.ee)\//i.test(s)) {
    const u = asUrl(s)
    if (!u) return undefined
    const id = u.pathname.match(/\/ti\/p\/([^/]+)/)?.[1]
    return { href: u.toString(), label: id ? decodeURIComponent(id).replace(/^~/, '') : 'LINE' }
  }
  return {
    href: `https://line.me/R/ti/p/${encodeURIComponent(s.startsWith('@') ? s : `~${s}`)}`,
    label: s,
  }
}

/** Website with https:// added if it was left out. */
export function websiteUrl(v?: string): string | undefined {
  const u = v?.trim() ? asUrl(v) : undefined
  return u && /^https?:$/.test(u.protocol) && u.hostname.includes('.') ? u.toString() : undefined
}

export type ContactLink = { key: keyof Contacts; label: string; value: string; href: string }

/** Contact rows for a place page, skipping anything that doesn't make a working link. */
export function contactLinks(c: Contacts): ContactLink[] {
  const links: ContactLink[] = []
  if (c.phone?.trim())
    links.push({ key: 'phone', label: 'โทร', value: c.phone, href: `tel:${c.phone.replace(/[^\d+]/g, '')}` })
  const line = lineLink(c.line)
  if (line) links.push({ key: 'line', label: 'LINE', value: line.label, href: line.href })
  const ig = instagramHandle(c.instagram)
  if (ig)
    links.push({
      key: 'instagram',
      label: 'Instagram',
      value: `@${ig}`,
      href: `https://www.instagram.com/${encodeURIComponent(ig)}/`,
    })
  const fb = facebookUrl(c.facebook)
  if (fb) links.push({ key: 'facebook', label: 'Facebook', value: facebookLabel(fb), href: fb })
  const web = websiteUrl(c.website)
  if (web)
    links.push({
      key: 'website',
      label: 'เว็บไซต์',
      value: websiteLabel(web),
      href: web,
    })
  return links
}
