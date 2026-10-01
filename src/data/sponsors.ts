export type Sponsor = {
  /** Category whose home tile the sponsor takes over. */
  category: string
  name: string
  /** Path or URL to the sponsor's logo; a placeholder box is shown without one. */
  logo?: string
  /** Inclusive ISO dates. */
  from: string
  to: string
}

// Sponsored featured tiles. A sponsor always gets the "สปอนเซอร์" label
// (yellow background, dark text). See /criteria for the sponsor policy.
// Example:
// { category: 'grooming', name: '[ชื่อผู้สนับสนุน]', from: '2026-10-01', to: '2026-10-31' }
export const sponsors: Sponsor[] = []
