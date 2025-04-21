'use client'

import { useRouter } from 'next/navigation'
import Modal from '@/components/Modal'
import LocationDetail from '@/components/LocationDetail'

type Props = {
  params: {
    slug: string
  }
}

export default function LocationModal({ params }: Props) {
  const router = useRouter()

  return (
    <Modal onClose={() => router.back()}>
      <LocationDetail slug={params.slug} />
    </Modal>
  )
}
