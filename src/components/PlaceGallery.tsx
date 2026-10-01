'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { Icon } from './Icon'
import { Photo } from './Photo'

type Props = { photos: string[]; name: string; back: string }

/** Swipeable photos on mobile (M-Place), 1+2 grid on desktop (D-Place). */
export function PlaceGallery({ photos, name, back }: Props) {
  const [index, setIndex] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const slides: (string | undefined)[] = photos.length ? photos : [undefined]
  const total = slides.length

  return (
    <>
      <div className="place-gallery">
        <div
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
        <Link href={back} className="icon-button place-gallery__back" aria-label="ย้อนกลับ">
          <Icon name="back" size={22} strokeWidth={2} />
        </Link>
        {total > 1 && (
          <>
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

      <div className="place-grid">
        <Photo src={photos[0]} alt={`รูป${name} 1`} iconSize={40} />
        <div className="place-grid__side">
          <Photo src={photos[1]} alt={`รูป${name} 2`} iconSize={40} />
          <div className="place-grid__more">
            <Photo src={photos[2]} alt={`รูป${name} 3`} iconSize={40} />
            {photos.length > 3 && (
              <button type="button" onClick={() => dialogRef.current?.showModal()}>
                ดูรูปทั้งหมด ({photos.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {photos.length > 3 && (
        <dialog
          ref={dialogRef}
          className="sheet photo-dialog"
          aria-label={`รูปทั้งหมดของ${name}`}
          onClick={(e) => {
            if (e.target === dialogRef.current) dialogRef.current?.close()
          }}
        >
          <div className="sheet__head">
            <h2>รูปทั้งหมด ({photos.length})</h2>
            <button
              type="button"
              className="icon-button sheet__close"
              aria-label="ปิด"
              onClick={() => dialogRef.current?.close()}
            >
              <Icon name="x" size={22} strokeWidth={2} />
            </button>
          </div>
          <div className="photo-dialog__list">
            {photos.map((src, i) => (
              <Photo key={i} src={src} alt={`รูป${name} ${i + 1}`} />
            ))}
          </div>
        </dialog>
      )}
    </>
  )
}
