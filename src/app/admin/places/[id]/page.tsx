import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConfirmSubmit } from '@/components/ConfirmSubmit'
import { getPlaceById } from '@/lib/admin-places'
import { requireAdminPage } from '@/lib/admin-page'
import { deletePlaceAction } from '../../actions'
import { PlaceEditor } from '../PlaceEditor'

type Props = { params: Promise<{ id: string }> }

export default async function EditPlace({ params }: Props) {
  await requireAdminPage()
  const place = await getPlaceById((await params).id)
  if (!place) notFound()

  return (
    <>
      <div className="admin-titlebar">
        <h1>แก้ไข: {place.name}</h1>
        {place.published !== false && (
          <Link href={`/place/${place.slug}`} className="btn btn--secondary btn--sm">
            ดูบนเว็บ
          </Link>
        )}
      </div>
      <PlaceEditor
        draft={{
          id: place.id,
          name: place.name,
          slug: place.slug,
          category: place.category,
          extraCategories: place.extraCategories ?? [],
          type: place.type,
          trainerStyle: place.trainerStyle,
          province: place.province,
          district: place.district ?? '',
          checkedAt: place.checkedAt,
          description: place.description,
          attributes: place.attributes,
          hours: place.hours,
          price: place.price,
          contacts: place.contacts,
          mapsUrl: place.mapsUrl ?? '',
          serviceAreas: place.serviceAreas ?? [],
          coords: place.lat != null && place.lng != null ? `${place.lat}, ${place.lng}` : '',
          photos: place.photos,
          breeds: place.breeds ?? [],
          maxDogKg: place.maxDogKg ? String(place.maxDogKg) : '',
          published: place.published !== false,
        }}
      />
      <form action={deletePlaceAction} className="admin-danger">
        <input type="hidden" name="id" value={place.id} />
        <p>ลบถาวร (ถ้าแค่อยากซ่อน ให้เอาติ๊ก &quot;แสดงบนเว็บ&quot; ออกแทน)</p>
        <ConfirmSubmit message={`ลบ “${place.name}” ถาวร?`}>ลบรายการนี้</ConfirmSubmit>
      </form>
    </>
  )
}
