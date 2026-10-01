import 'server-only'
import type { Session } from './session'

export type Submission =
  | {
      kind: 'new'
      name: string
      category: string
      mapsUrl: string
      province: string
      district?: string
      note?: string
    }
  | {
      kind: 'report'
      place?: string
      placeName: string
      details: string
    }

export type StoredSubmission = Submission & {
  submittedBy: Session
  submittedAt: string
  photos: { name: string; type: string; size: number }[]
}

/**
 * Hands a submission to the team.
 *
 * TODO(build-spec): pick where submissions go (database, Google Sheet, LINE
 * Notify to the team, ...) and store the photo files. Until then this only
 * logs in development and refuses in production so nothing is silently lost.
 */
export async function saveSubmission(entry: StoredSubmission, photos: File[]): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Submission storage is not configured')
  }
  console.info('[submission]', JSON.stringify(entry), `${photos.length} photo(s)`)
}
