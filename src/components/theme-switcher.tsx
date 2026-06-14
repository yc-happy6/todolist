'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const THEMES = [
  { key: 'default', label: '高效', icon: '☀️' },
  { key: 'dark', label: '深夜', icon: '🌙' },
  { key: 'calm', label: '莫兰迪', icon: '🌿' },
  { key: 'vibrant', label: '多巴胺', icon: '🔥' },
] as const

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
        {THEMES.map((t) => (
          <span
            key={t.key}
            className="size-8 flex items-center justify-center text-xs rounded"
          >
            {t.icon}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
      {THEMES.map((t) => (
        <button
          key={t.key}
          onClick={() => setTheme(t.key)}
          title={t.label}
          className={`size-8 flex items-center justify-center text-sm rounded transition-all ${
            theme === t.key
              ? 'bg-background shadow-sm scale-110'
              : 'hover:bg-background/50'
          }`}
        >
          {t.icon}
        </button>
      ))}
    </div>
  )
}
