'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Place } from '@/data/places'
import { PlaceEditor } from '../PlaceEditor'
import { applyUpdatesAction, saveAllNewAction, type SaveAllState, type UpdateState } from './actions'
import { findExisting, parseImport, type ImportItem } from './parse'
import { toPatch } from './patch'

// The pasted text survives the save redirect, so a list can be worked through one by one.
const KEY = 'sd_import'

export function ImportPlaces({ today, existing }: { today: string; existing: Place[] }) {
  const [text, setText] = useState('')
  const [items, setItems] = useState<ImportItem[]>([])
  const [updates, setUpdates] = useState<Record<string, unknown>[]>([])
  // Recomputed against the listed places, so a saved update shows as done.
  const patches = useMemo(() => updates.map((u) => toPatch(u, existing, today)), [updates, existing, today])
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
      setUpdates([])
      setOpen(null)
      return
    }
    setError('')
    setItems(r.items)
    setUpdates(r.updates)
    setOpen(r.items.length === 1 ? 0 : null)
    try {
      sessionStorage.setItem(KEY, value)
    } catch {}
  }

  function clear() {
    setText('')
    setItems([])
    setUpdates([])
    setError('')
    setOpen(null)
    try {
      sessionStorage.removeItem(KEY)
    } catch {}
  }

  const item = open == null ? undefined : items[open]
  const duplicate = item && findExisting(item.draft, existing)

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

      {patches.length > 0 && <UpdateList text={text} patches={patches} />}

      {items.length > 1 && (
        <SaveAll text={text} fresh={items.filter((it) => !findExisting(it.draft, existing)).length} />
      )}

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
                {findExisting(it.draft, existing) && <span className="admin-badge">มีในระบบแล้ว</span>}
                {it.warnings.length > 0 && <span className="admin-badge">ต้องแก้ {it.warnings.length}</span>}
              </button>
            </li>
          ))}
        </ol>
      )}

      {item && (
        <section className="admin-import__item" aria-label={item.draft.name}>
          {duplicate && (
            <p className="auth__error" role="alert">
              ร้านนี้น่าจะมีในระบบแล้ว: <b>{duplicate.name}</b> (/{duplicate.slug}) · ข้ามได้เลย หรือ{' '}
              {duplicate.id ? (
                <Link href={`/admin/places/${duplicate.id}`}>เปิดรายการเดิมเพื่อแก้ไข</Link>
              ) : (
                'แก้รายการเดิมแทน'
              )}
            </p>
          )}
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

/** Saves every new place in the list as pasted; each one can still be opened and edited later. */
function SaveAll({ text, fresh }: { text: string; fresh: number }) {
  const [state, action, pending] = useActionState<SaveAllState, FormData>(saveAllNewAction, {})
  return (
    <section className="admin-section admin-import__saveall" aria-label="บันทึกทั้งหมด">
      <form
        action={action}
        onSubmit={(ev) => {
          if (
            !window.confirm(`บันทึกร้านใหม่ ${fresh} ร้านตามข้อมูลที่วางเลยไหม (ร้านที่มีในระบบแล้วจะข้าม)`)
          )
            ev.preventDefault()
        }}
      >
        <input type="hidden" name="text" value={text} />
        <button type="submit" className="btn btn--primary btn--sm" disabled={pending || !fresh}>
          {pending ? 'กำลังบันทึก…' : fresh ? `บันทึกทั้งหมด (${fresh} ร้านใหม่)` : 'บันทึกครบแล้ว'}
        </button>
      </form>
      <p className="admin-hint">
        บันทึกตามข้อมูลที่วางโดยไม่ต้องเปิดทีละร้าน รูปและรายละเอียดอื่นค่อยเข้าไปเพิ่มในหน้าร้านทีหลัง
      </p>
      {state.message && (
        <p className="auth__error" role="alert">
          {state.message}
        </p>
      )}
      {state.saved && (
        <div className="admin-notice" role="status">
          บันทึกแล้ว {state.saved.length} ร้าน
          {state.skipped?.length ? ` · ข้าม ${state.skipped.length} ร้านที่มีในระบบแล้ว` : ''}
          {state.failed?.length ? (
            <>
              {' '}
              · ไม่สำเร็จ {state.failed.length} ร้าน (เปิดแก้ทีละร้านด้านล่าง)
              <ul>
                {state.failed.map((f) => (
                  <li key={f.name}>
                    <b>{f.name}</b>: {f.reason}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      )}
    </section>
  )
}

function UpdateList({ text, patches }: { text: string; patches: ReturnType<typeof toPatch>[] }) {
  const [state, action, pending] = useActionState<UpdateState, FormData>(applyUpdatesAction, {})
  const ready = patches.filter((p) => p.id && p.changes.length)
  return (
    <section className="admin-section admin-import__updates" aria-label="แก้ร้านเดิม">
      <h2>แก้ร้านเดิม {patches.length} ร้าน</h2>
      <p className="admin-hint">
        แก้เฉพาะช่องที่ส่งมา ช่องอื่นคงเดิม ชื่อ หมวด ที่ตั้ง และรูปแก้ในหน้าร้านเท่านั้น
      </p>
      {state.message && (
        <p className="auth__error" role="alert">
          {state.message}
        </p>
      )}
      {state.updated != null && (
        <p className="admin-notice" role="status">
          บันทึกแล้ว {state.updated} ร้าน
          {state.failed?.length ? ` · ไม่สำเร็จ: ${state.failed.join(', ')}` : ''}
        </p>
      )}
      <form action={action}>
        <input type="hidden" name="text" value={text} />
        <button type="submit" className="btn btn--primary btn--sm" disabled={pending || !ready.length}>
          {pending
            ? 'กำลังบันทึก…'
            : ready.length
              ? `บันทึกการแก้ทั้งหมด (${ready.length} ร้าน)`
              : 'ไม่มีอะไรต้องแก้แล้ว'}
        </button>
      </form>
      <ol className="admin-import__list">
        {patches.map((p, i) => (
          <li key={`${p.slug}-${i}`} className="admin-import__update">
            <b>{p.name}</b>{' '}
            {p.id ? (
              <Link href={`/admin/places/${p.id}`} target="_blank">
                /{p.slug}
              </Link>
            ) : (
              <span>/{p.slug}</span>
            )}
            {p.id && !p.changes.length && <span className="admin-badge">ไม่มีอะไรเปลี่ยน</span>}
            {p.warnings.length > 0 && (
              <ul className="auth__error">
                {p.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
            {p.changes.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <tbody>
                    {p.changes.map((c) => (
                      <tr key={c.label}>
                        <th scope="row">{c.label}</th>
                        <td>{c.from}</td>
                        <td>→ {c.to}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {p.notes.length > 0 && (
              <ul className="admin-hint">
                {p.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
            {p.sources.length > 0 && (
              <p className="admin-hint">
                {p.sources.map((s) => (
                  <Link key={s} href={s} target="_blank" rel="noopener noreferrer">
                    {s.replace(/^https?:\/\/(www\.)?/, '').slice(0, 50)}{' '}
                  </Link>
                ))}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
