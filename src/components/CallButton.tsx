'use client'

import { Icon } from './Icon'

// The team's number is never rendered: it is put together only when the button is
// pressed, so it does not show on the page or in the HTML that scrapers read.
const PARTS = ['081', '949', '6389']

export function CallButton({ label = 'โทรหาทีมงาน' }: { label?: string }) {
  return (
    <button
      type="button"
      className="btn btn--primary btn--block"
      data-track="team_call_click"
      onClick={() => {
        window.location.href = `tel:+66${PARTS.join('').slice(1)}`
      }}
    >
      <Icon name="phone" size={20} strokeWidth={2} />
      <span>{label}</span>
    </button>
  )
}
