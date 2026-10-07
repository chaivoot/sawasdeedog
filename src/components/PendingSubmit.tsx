'use client'

import { useFormStatus } from 'react-dom'

/** Submit button that disables itself and shows `pending` while a slow server action runs. */
export function PendingSubmit({
  children,
  pending,
}: {
  children: React.ReactNode
  pending: React.ReactNode
}) {
  const status = useFormStatus()
  return (
    <>
      <button type="submit" className="btn btn--secondary btn--sm" disabled={status.pending}>
        {status.pending ? 'กำลังทำงาน…' : children}
      </button>
      {status.pending && (
        <span className="admin-pending" role="status">
          {pending}
        </span>
      )}
    </>
  )
}
