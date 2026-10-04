'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Shows `src`, switching to `fallback` if it fails to load. Used for card-sized copies,
 * which older photos may not have yet. A load error can fire before hydration, so the
 * image's state is also checked once mounted.
 */
export function PhotoImg({ src, fallback, alt }: { src: string; fallback: string; alt: string }) {
  const [current, setCurrent] = useState(src)
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = ref.current
    if (img?.complete && img.naturalWidth === 0) setCurrent(fallback)
  }, [fallback])

  return (
    // eslint-disable-next-line @next/next/no-img-element -- storage URLs; sizes are made at upload
    <img
      ref={ref}
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setCurrent((c) => (c === fallback ? c : fallback))}
    />
  )
}
