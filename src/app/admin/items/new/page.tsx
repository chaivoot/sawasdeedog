import { requireAdminPage } from '@/lib/admin-page'
import { ItemEditor } from '../ItemEditor'

export default async function NewItem() {
  await requireAdminPage()
  return (
    <>
      <h1>เพิ่มไอเทม</h1>
      <ItemEditor
        draft={{
          name: '',
          brand: '',
          category: '',
          subcategory: '',
          imageUrl: '',
          priceNote: '',
          reason: '',
          recommendedBy: 'ครูวุฒิ',
          buyUrl: '',
          sort: '',
          published: false,
        }}
      />
    </>
  )
}
