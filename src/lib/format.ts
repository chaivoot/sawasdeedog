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

const dayMonthYearTime = new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TZ,
})

/** "2 พ.ย. 2026 09:00" for an ISO timestamp, in Bangkok time. */
export function formatDateTime(iso: string) {
  return dayMonthYearTime.format(new Date(iso))
}

/** An ISO timestamp as a datetime-local value ("YYYY-MM-DDTHH:mm") in Bangkok time. */
export function toBangkokInput(iso: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const p = (t: string) => parts.find((x) => x.type === t)?.value ?? ''
  return `${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}`
}

/** A datetime-local value ("YYYY-MM-DDTHH:mm") read as Bangkok time; undefined if malformed. */
export function fromBangkokInput(v: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return undefined
  const d = new Date(`${v}:00+07:00`)
  return Number.isNaN(d.getTime()) ? undefined : d
}
