import { requireAdminPage } from '@/lib/admin-page'
import { todayInBangkok } from '@/lib/format'
import { ImportPlaces } from './ImportPlaces'

export default async function ImportPlacesPage() {
  await requireAdminPage()
  return (
    <>
      <h1>นำเข้าข้อมูล</h1>
      <ImportPlaces today={todayInBangkok()} />
    </>
  )
}
