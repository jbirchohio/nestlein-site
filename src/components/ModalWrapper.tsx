'use client'

import { useSearchParams } from 'next/navigation'
import Modal from '@/components/Modal'
import LocationDetail from '@/components/LocationDetail'

export default function ModalWrapper() {
  const searchParams = useSearchParams()
  const currentSlug = searchParams.get('modal')

  if (!currentSlug) return null

  return (
    <Modal onClose={() => history.back()}>
      <LocationDetail slug={currentSlug} />
    </Modal>
  )
}
