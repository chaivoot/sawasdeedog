'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { Icon } from './Icon'
import { Photo } from './Photo'

type Props = { photos: string[]; name: string; back: string; view: 'mobile' | 'desktop' }

/**
 * Swipeable photos: full-bleed with dots on mobile (M-Place); on desktop (D-Place) a 4:3 slider at
 * the top of the main column, beside the aside, with prev/next buttons.
 */
export function PlaceGallery({ photos, name, back, view }: Props) {
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const slides: (string | undefined)[] = photos.length ? photos : [undefined]
  const total = slides.length
  const desktop = view === 'desktop'

  function go(to: number) {
    const el = trackRef.current
    if (el) el.scrollTo({ left: to * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className={desktop ? 'place-gallery place-gallery--desktop' : 'place-gallery'}>
      <div
        ref={trackRef}
        className="place-gallery__track"
        onScroll={(e) => {
          const el = e.currentTarget
          setIndex(Math.round(el.scrollLeft / el.clientWidth))
        }}
      >
        {slides.map((src, i) => (
          <Photo key={i} src={src} alt={`รูป${name} ${i + 1} จาก ${total}`} iconSize={40} />
        ))}
      </div>
      {!desktop && (
        <Link href={back} className="icon-button place-gallery__back" aria-label="ย้อนกลับ">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
      )}
      {total > 1 && (
        <>
          {desktop && (
            <>
              <button
                type="button"
                className="icon-button place-gallery__nav place-gallery__nav--prev"
                aria-label="รูปก่อนหน้า"
                disabled={index === 0}
                onClick={() => go(index - 1)}
              >
                <Icon name="back" size={22} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="icon-button place-gallery__nav place-gallery__nav--next"
                aria-label="รูปถัดไป"
                disabled={index === total - 1}
                onClick={() => go(index + 1)}
              >
                <Icon name="right" size={22} strokeWidth={2} />
              </button>
            </>
          )}
          <span className="place-gallery__counter" aria-hidden="true">
            {index + 1} / {total}
          </span>
          <div className="place-gallery__dots" aria-hidden="true">
            {slides.map((_, i) => (
              <span key={i} data-active={i === index} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
