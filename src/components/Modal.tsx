'use client'

import { useEffect } from 'react'
import { useSwipeToDismiss } from '@/hooks/useSwipeToDismiss'

export default function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  const { ref, bounced } = useSwipeToDismiss(onClose, 140) // ← raise threshold

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('modal-open')

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center modal-blur-bg p-4 sm:p-6 animate-fade-in">
      <div
        ref={ref}
        className={`relative bg-[var(--background)] rounded-t-2xl sm:rounded-2xl border border-[var(--accent-light)]
          w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out
          ${bounced ? 'modal-bounce' : 'animate-slide-up sm:animate-zoom-in'} shadow-[0_15px_40px_rgba(0,0,0,0.2)] z-[1001]`}
      >
        <div className="block sm:hidden w-full flex justify-center py-2">
          <div className="w-12 h-1.5 rounded-full bg-gray-300" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-[var(--background)] p-2 rounded-full shadow-md text-[var(--accent)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)] transition-all z-[1002] flex flex-col items-center"
          aria-label="Close"
        >
          <span className="text-lg font-bold">✕</span>
          <span className="block text-[10px] mt-0.5 text-[var(--color-text-secondary)] md:hidden">
            Close
          </span>
        </button>

        <div className="p-6 modal-scroll-shadow">
          {children}
        </div>
      </div>
    </div>
  )
}
