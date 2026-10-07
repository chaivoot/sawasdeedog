import { requireAdminPage } from '@/lib/admin-page'
import { todayInBangkok } from '@/lib/format'
import { ProductEditor } from '../ProductEditor'

export default async function NewProduct() {
  await requireAdminPage()
  return (
    <>
      <h1>เพิ่มสินค้า</h1>
      <ProductEditor
        draft={{
          name: '',
          group: '',
          reason: '',
          imageUrl: '',
          shopeeUrl: '',
          sort: '',
          checkedAt: todayInBangkok(),
          published: true,
        }}
      />
    </>
  )
}
