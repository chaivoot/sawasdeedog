import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConfirmSubmit } from '@/components/ConfirmSubmit'
import { requireAdminPage } from '@/lib/admin-page'
import { getProductById } from '@/lib/products'
import { deleteProductAction } from '../actions'
import { ProductEditor } from '../ProductEditor'

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }

export default async function EditProduct({ params, searchParams }: Props) {
  await requireAdminPage()
  const p = await getProductById((await params).id)
  if (!p) notFound()
  const { saved } = await searchParams

  return (
    <>
      <div className="admin-titlebar">
        <h1>แก้ไขสินค้า</h1>
        {p.published && (
          <Link href={`/shopping#${p.group}`} className="btn btn--secondary btn--sm">
            ดูบนเว็บ
          </Link>
        )}
      </div>
      {saved && <p className="admin-notice">บันทึกแล้ว</p>}
      <ProductEditor
        key={p.updatedAt}
        draft={{
          id: p.id,
          name: p.name,
          group: p.group,
          reason: p.reason ?? '',
          imageUrl: p.imageUrl ?? '',
          shopeeUrl: p.shopeeUrl,
          sort: String(p.sort),
          checkedAt: p.checkedAt,
          published: p.published,
        }}
      />
      <form action={deleteProductAction} className="admin-danger">
        <input type="hidden" name="id" value={p.id} />
        <ConfirmSubmit message={`ลบสินค้า “${p.name}” ถาวร?`}>ลบสินค้านี้</ConfirmSubmit>
      </form>
    </>
  )
}
