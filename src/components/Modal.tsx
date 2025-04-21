'use client'

import { useEffect } from 'react'

export default function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-[var(--background)] rounded-2xl shadow-2xl border border-[var(--accent-light)] w-full max-w-3xl max-h-[90vh] overflow-y-auto transition-transform scale-95 animate-zoom-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-[var(--background)] p-2 rounded-full shadow-md text-[var(--accent)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)] transition-all z-50 flex flex-col items-center"
          aria-label="Close"
        >
          <span className="text-lg font-bold">✕</span>
          <span className="block text-[10px] mt-0.5 text-[var(--color-text-secondary)] md:hidden">
            Close
          </span>
        </button>

        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
