'use client'

import { useEffect, useRef, useState } from 'react'

export function useSwipeToDismiss(onClose: () => void, threshold = 80) {
  const ref = useRef<HTMLDivElement>(null)
  const startY = useRef<number | null>(null)
  const [bounced, setBounced] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current === null || !ref.current) return
      const deltaY = e.touches[0].clientY - startY.current
      if (deltaY > 0 && deltaY < 150) {
        ref.current.style.transform = `translateY(${deltaY}px)`
        ref.current.style.opacity = `${1 - deltaY / 200}`
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (startY.current === null || !ref.current) return
      const deltaY = e.changedTouches[0].clientY - startY.current
      startY.current = null

      if (deltaY > threshold) {
        navigator.vibrate?.(10)
        onClose()
      } else {
        ref.current.style.transform = 'translateY(0)'
        ref.current.style.opacity = '1'
        setBounced(true)
        setTimeout(() => setBounced(false), 300)
      }
    }

    document.addEventListener('touchstart', onTouchStart)
    document.addEventListener('touchmove', onTouchMove)
    document.addEventListener('touchend', onTouchEnd)

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [onClose, threshold])

  return { ref, bounced }
}
