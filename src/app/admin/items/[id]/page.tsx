import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConfirmSubmit } from '@/components/ConfirmSubmit'
import { requireAdminPage } from '@/lib/admin-page'
import { getProductById, productPath } from '@/lib/products'
import { deleteItemAction } from '../actions'
import { ItemEditor } from '../ItemEditor'

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }

export default async function EditItem({ params, searchParams }: Props) {
  await requireAdminPage()
  const p = await getProductById((await params).id)
  if (!p) notFound()
  const { saved } = await searchParams

  return (
    <>
      <div className="admin-titlebar">
        <h1>แก้ไขไอเทม</h1>
        {p.published && (
          <Link href={productPath(p)} className="btn btn--secondary btn--sm">
            ดูบนเว็บ
          </Link>
        )}
      </div>
      {saved && <p className="admin-notice">บันทึกแล้ว</p>}
      <ItemEditor
        key={p.updatedAt}
        id={p.id}
        draft={{
          slug: p.slug ?? '',
          name: p.name,
          brand: p.brand ?? '',
          category: p.category,
          subcategory: p.subcategory ?? '',
          imageUrl: p.imageUrl ?? '',
          priceNote: p.priceNote ?? '',
          reason: p.reason ?? '',
          recommendedBy: p.recommendedBy ?? '',
          buyUrl: p.buyUrl ?? '',
          sort: String(p.sort),
          published: p.published,
        }}
      />
      <form action={deleteItemAction} className="admin-danger">
        <input type="hidden" name="id" value={p.id} />
        <ConfirmSubmit message={`ลบ “${p.name}” ถาวร?`}>ลบไอเทมนี้</ConfirmSubmit>
      </form>
    </>
  )
}
