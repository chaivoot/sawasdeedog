'use client'

import { useState } from 'react'

/**
 * Copies the page URL and opens Search Console, where the admin pastes it into the inspect
 * bar to "Request indexing". Search Console links can't open a given URL's inspection directly.
 */
export function InspectLink({ consoleUrl, url }: { consoleUrl: string; url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <a
      href={consoleUrl}
      target="_blank"
      rel="noreferrer"
      className="admin-hint"
      onClick={() => {
        navigator.clipboard?.writeText(url).then(
          () => setCopied(true),
          () => setCopied(false),
        )
      }}
    >
      {copied
        ? 'คัดลอกลิงก์แล้ว วางในช่องค้นหาด้านบนของ Search Console'
        : 'คัดลอกลิงก์ + เปิด Search Console →'}
    </a>
  )
}
