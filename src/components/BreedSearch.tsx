'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { breedMatches, breedPhoto } from '@/data/breeds'
import type { BreedWithCount } from '@/lib/places'
import { Icon } from './Icon'
import { LogoMark } from './Logo'

export function BreedSearch({ breeds, intro }: { breeds: BreedWithCount[]; intro: ReactNode }) {
  const [query, setQuery] = useState('')
  const shown = breeds.filter((b) => breedMatches(b, query))

  return (
    <>
      <div className="breed-head">
        {intro}
        <div className="breed-head__search">
          <label className="search-field search-field--lg">
            <Icon name="search" size={20} strokeWidth={2} />
            <span className="sr-only">ค้นหาสายพันธุ์</span>
            <input
              type="search"
              placeholder="ค้นหาสายพันธุ์ ไทยหรืออังกฤษ"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="search-field__clear"
                aria-label="ล้างคำค้น"
                onClick={() => setQuery('')}
              >
                <Icon name="x" size={18} strokeWidth={2} />
              </button>
            )}
          </label>
        </div>
      </div>

      <div>
        {shown.length > 0 ? (
          <div className="breed-list">
            {shown.map((b) => (
              <Link key={b.slug} href={`/farm/${b.slug}`} className="breed-row">
                {/* eslint-disable-next-line @next/next/no-img-element -- small static thumbnails */}
                <img className="breed-row__photo" src={breedPhoto(b.slug)} alt="" loading="lazy" />
                <span className="breed-row__names">
                  <span className="breed-row__th">{b.name}</span>
                  <span className="breed-row__en">{b.nameEn}</span>
                </span>
                <span className="count-pill">{b.farmCount} ฟาร์ม</span>
                <Icon name="right" size={20} strokeWidth={2} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty empty--compact" role="status">
            <span className="empty__icon">
              <LogoMark size={44} />
            </span>
            <h2>ยังไม่มีฟาร์ม{query.trim()}ในรายการ</h2>
            <p>รู้จักฟาร์มสายพันธุ์นี้ที่ดูแลหมาดี เสนอให้ทีมช่วยเช็คได้เลย</p>
            <div className="empty__actions">
              <Link href="/submit?category=farm" className="btn btn--primary btn--block">
                <Icon name="plus" size={20} strokeWidth={2.2} />
                <span>เสนอฟาร์ม</span>
              </Link>
              <button type="button" className="btn btn--secondary btn--block" onClick={() => setQuery('')}>
                ดูสายพันธุ์ทั้งหมด
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
