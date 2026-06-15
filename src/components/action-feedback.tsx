'use client'

import { useEffect } from 'react'

interface ActionFeedbackProps {
  x: number
  y: number
  message: string
  type: 'success' | 'delete'
  onClose: () => void
}

export function ActionFeedback({ x, y, message, type, onClose }: ActionFeedbackProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 800)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{ left: x, top: y }}
    >
      <div
        className={`px-4 py-2 rounded-full text-white text-sm font-semibold whitespace-nowrap shadow-lg ${
          type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}
        style={{ animation: 'popupFadeOut 0.8s ease-out forwards' }}
      >
        {message}
      </div>
    </div>
  )
}
