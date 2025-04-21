// components/Modal.tsx
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-[var(--background)] rounded-2xl shadow-2xl border border-[var(--accent-light)] w-full max-w-3xl max-h-[90vh] overflow-y-auto transition-transform scale-95 animate-zoom-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl text-[var(--accent)] hover:text-[var(--foreground)] font-bold"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
 