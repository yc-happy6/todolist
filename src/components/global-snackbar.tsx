'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface GlobalSnackbarProps {
  message: string
  type: 'success' | 'delete'
  onClose: () => void
}

export function GlobalSnackbar({ message, type, onClose }: GlobalSnackbarProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000)
    return () => clearTimeout(timer)
  }, [onClose])

  return createPortal(
    <div className="fixed top-0 left-0 right-0 z-[9998] flex justify-center pointer-events-none">
      <div
        className={`mt-4 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg backdrop-blur-md pointer-events-auto ${
          type === 'success'
            ? 'bg-emerald-500/90'
            : 'bg-red-500/90'
        }`}
        style={{
          animation: 'slideDownFade 0.3s ease-out',
        }}
      >
        {message}
      </div>
    </div>,
    document.body
  )
}
