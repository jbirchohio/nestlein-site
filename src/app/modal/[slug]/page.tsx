'use client'

import { useRouter } from 'next/navigation'
import Modal from '@/components/Modal'
import LocationDetail from '@/components/LocationDetail'

export default function LocationModal({ params }: { params: { slug: string } }) {
  const router = useRouter()

  return (
    <Modal onClose={() => router.back()}>
      <LocationDetail slug={params.slug} />
    </Modal>
  )
}
