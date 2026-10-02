'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlaceEditor } from '../PlaceEditor'
import { parseImport, type ImportItem } from './parse'

// The pasted text survives the save redirect, so a list can be worked through one by one.
const KEY = 'sd_import'

export function ImportPlaces({ today }: { today: string }) {
  const [text, setText] = useState('')
  const [items, setItems] = useState<ImportItem[]>([])
  const [error, setError] = useState('')
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY)
      if (saved) read(saved)
    } catch {}
    // Restore once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function read(value: string) {
    setText(value)
    const r = parseImport(value, today)
    if ('error' in r) {
      setError(r.error)
      setItems([])
      setOpen(null)
      return
    }
    setError('')
    setItems(r.items)
    setOpen(r.items.length === 1 ? 0 : null)
    try {
      sessionStorage.setItem(KEY, value)
    } catch {}
  }

  function clear() {
    setText('')
    setItems([])
    setError('')
    setOpen(null)
    try {
      sessionStorage.removeItem(KEY)
    } catch {}
  }

  const item = open == null ? undefined : items[open]

  return (
    <>
      <form
        className="form admin-import"
        onSubmit={(ev) => {
          ev.preventDefault()
          read(text)
        }}
      >
        <label htmlFor="import" className="field__label">
          วางข้อมูลที่ได้จาก Claude (ร้านเดียว หรือหลายร้านก็ได้)
        </label>
        <textarea
          id="import"
          className="input admin-import__text"
          rows={8}
          value={text}
          onChange={(ev) => setText(ev.target.value)}
          placeholder='{ "name": "…", "category": "cafe", … }'
          spellCheck={false}
        />
        {error && (
          <p className="auth__error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-import__actions">
          <button type="submit" className="btn btn--primary btn--sm">
            อ่านข้อมูล
          </button>
          {(text || items.length > 0) && (
            <button type="button" className="btn btn--secondary btn--sm" onClick={clear}>
              ล้าง
            </button>
          )}
        </div>
      </form>

      {items.length > 1 && (
        <ol className="admin-import__list">
          {items.map((it, i) => (
            <li key={i}>
              <button
                type="button"
                className={`admin-import__pick${open === i ? ' is-active' : ''}`}
                onClick={() => setOpen(i)}
              >
                {it.draft.name || `รายการที่ ${i + 1}`}
                {it.warnings.length > 0 && <span className="admin-badge">ต้องแก้ {it.warnings.length}</span>}
              </button>
            </li>
          ))}
        </ol>
      )}

      {item && (
        <section className="admin-import__item" aria-label={item.draft.name}>
          {(item.notes.length > 0 || item.warnings.length > 0 || item.sources.length > 0) && (
            <div className="admin-notice admin-import__checks">
              {item.warnings.length > 0 && (
                <>
                  <b>ใช้ไม่ได้ ต้องกรอกเอง</b>
                  <ul>
                    {item.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </>
              )}
              {item.notes.length > 0 && (
                <>
                  <b>ต้องเช็คก่อนเปิดแสดง</b>
                  <ul>
                    {item.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </>
              )}
              {item.sources.length > 0 && (
                <>
                  <b>แหล่งข้อมูล</b>
                  <ul>
                    {item.sources.map((s) => (
                      <li key={s}>
                        <Link href={s} target="_blank" rel="noopener noreferrer">
                          {s.replace(/^https?:\/\/(www\.)?/, '').slice(0, 60)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
          <p className="muted">ยังไม่ถูกบันทึก · ตรวจข้อมูล ใส่รูป แล้วกดบันทึก</p>
          {/* Remount per item so the form starts from that draft. */}
          <PlaceEditor key={`${open}-${item.draft.name}`} draft={item.draft} />
        </section>
      )}
    </>
  )
}
