import { requireAdminPage } from '@/lib/admin-page'
import { listAllPlaces } from '@/lib/admin-places'
import { todayInBangkok } from '@/lib/format'
import { ImportPlaces } from './ImportPlaces'

export default async function ImportPlacesPage() {
  await requireAdminPage()
  // To flag pasted places that are already listed, and to show what an update changes.
  const existing = await listAllPlaces()
  return (
    <>
      <h1>นำเข้าข้อมูล</h1>
      <ImportPlaces today={todayInBangkok()} existing={existing} />
    </>
  )
}
