const TZ = 'Asia/Bangkok'

const dayMonthYear = new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: TZ,
})

function parse(iso: string) {
  // Noon UTC keeps the calendar date stable in Asia/Bangkok.
  return new Date(`${iso}T12:00:00Z`)
}

/** "2026": the year (C.E.) of a YYYY-MM-DD date. */
export function formatYear(iso: string) {
  return iso.slice(0, 4)
}

/** "12 ก.ย. 2026" (Thai month, C.E. year, like the last-checked year) */
export function formatDay(iso: string) {
  return dayMonthYear.format(parse(iso))
}

/** Today's date in Bangkok as YYYY-MM-DD. */
export function todayInBangkok(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(now)
}
