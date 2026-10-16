'use client'

import { useActionState } from 'react'
import { importItemsAction, type ImportState } from './actions'

/** Paste a JSON array to add many items at once. */
export function ImportItems() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importItemsAction, {})
  return (
    <form action={action} className="form admin-form">
      <fieldset className="admin-fieldset">
        <legend>นำเข้าหลายรายการ (JSON array)</legend>
        <textarea
          name="json"
          className="input"
          rows={8}
          placeholder='[{"name": "...", "brand": "...", "category": "food", "subcategory": "kibble", "reason": "...", "buyUrl": "https://...", "published": false}]'
          aria-label="JSON ไอเทมหลายรายการ"
        />
        {state.message && <p className="auth__error">{state.message}</p>}
        {state.errors && (
          <ul className="field__error" role="alert">
            {state.errors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
        <button type="submit" className="btn btn--secondary btn--sm" disabled={pending}>
          {pending ? 'กำลังนำเข้า…' : 'นำเข้า'}
        </button>
      </fieldset>
    </form>
  )
}
