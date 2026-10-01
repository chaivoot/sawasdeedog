'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import type { BreedWithCount } from '@/lib/places'
import { Icon } from './Icon'
import { LogoMark } from './Logo'

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, '')
}

export function BreedSearch({ breeds, intro }: { breeds: BreedWithCount[]; intro: ReactNode }) {
  const [query, setQuery] = useState('')
  const q = normalize(query)
  const shown = q
    ? breeds.filter((b) => normalize(b.name).includes(q) || normalize(b.nameEn).includes(q))
    : breeds

  return (
    <>
      <div className="page-head page-head--end">
        {intro}
        <div className="page-head__side page-head__side--wide">
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
            <h2>ยังไม่มีฟาร์ม{query.trim()}ที่ผ่านเกณฑ์</h2>
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
