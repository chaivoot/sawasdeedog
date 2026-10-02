import { requireAdminPage } from '@/lib/admin-page'
import { todayInBangkok } from '@/lib/format'
import { getSubmission } from '@/lib/submissions'
import { PlaceEditor, type PlaceDraft } from '../PlaceEditor'

type Props = { searchParams: Promise<{ submission?: string }> }

export default async function NewPlace({ searchParams }: Props) {
  await requireAdminPage()
  const { submission: submissionId } = await searchParams
  const s = submissionId ? await getSubmission(submissionId) : undefined
  const fromNew = s?.kind === 'new' ? s : undefined

  const draft: PlaceDraft = {
    name: fromNew?.payload.name ?? '',
    slug: '',
    category: fromNew?.payload.category ?? '',
    extraCategories: [],
    province: fromNew?.payload.province ?? 'bangkok',
    district: fromNew?.payload.district ?? '',
    checkedAt: todayInBangkok(),
    mapsUrl: fromNew?.payload.mapsUrl ?? '',
    serviceAreas: [],
    coords: '',
    attributes: [],
    breeds: [],
    photos: [],
    contacts: {},
    published: true,
  }

  return (
    <>
      <h1>เพิ่มรายการ</h1>
      {fromNew && (
        <p className="admin-notice">
          สร้างจากข้อมูลที่ {fromNew.submitted_by_name} ส่งมา
          {fromNew.payload.note && <> · โน้ต: {fromNew.payload.note}</>}
        </p>
      )}
      <PlaceEditor draft={draft} fromSubmission={fromNew?.id} />
    </>
  )
}
