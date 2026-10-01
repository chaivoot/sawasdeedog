'use client'

/** Submit button that asks before submitting (e.g. deletes). */
export function ConfirmSubmit({ message, children }: { message: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="btn btn--secondary"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault()
      }}
    >
      {children}
    </button>
  )
}
