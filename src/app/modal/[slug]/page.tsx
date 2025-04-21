'use client'

import { useRouter } from 'next/navigation'
import Modal from '@/components/Modal'
import LocationDetail from '@/components/LocationDetail'
import type { PageProps } from 'next'

export default function LocationModal({ params }: PageProps<{ slug: string }>) {
  const router = useRouter()

  return (
    <Modal onClose={() => router.back()}>
      <LocationDetail slug={params.slug} />
    </Modal>
  )
}
