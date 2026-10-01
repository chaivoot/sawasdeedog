const TZ = 'Asia/Bangkok'

const monthYear = new Intl.DateTimeFormat('th-TH', { month: 'short', year: 'numeric', timeZone: TZ })
const dayMonthYear = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: TZ,
})

function parse(iso: string) {
  // Noon UTC keeps the calendar date stable in Asia/Bangkok.
  return new Date(`${iso}T12:00:00Z`)
}

/** "ก.ย. 2569" */
export function formatMonth(iso: string) {
  return monthYear.format(parse(iso))
}

/** "12 ก.ย. 2569" */
export function formatDay(iso: string) {
  return dayMonthYear.format(parse(iso))
}

/** Today's date in Bangkok as YYYY-MM-DD. */
export function todayInBangkok(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(now)
}
