// src/app/(home)/locations/[slug]/page.tsx
'use client'

import LocationDetail from '@/components/LocationDetail'
import Modal from '@/components/Modal'
import { useRouter } from 'next/navigation'

export default function LocationModal({ params }: { params: { slug: string } }) {
  const router = useRouter()

  return (
    <Modal onClose={() => router.back()}>
      <LocationDetail slug={params.slug} />
    </Modal>
  )
}
