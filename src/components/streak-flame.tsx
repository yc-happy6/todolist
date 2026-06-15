'use client'

import { useEffect, useRef, useState } from 'react'

interface StreakFlameProps {
  streak: number
}

function getFlameConfig(streak: number) {
  if (streak >= 30) {
    return {
      fontSize: 56,
      color: '#fbbf24',
      glow: 'drop-shadow(0 0 12px #fbbf24) drop-shadow(0 0 24px rgba(251,191,36,0.5))',
      level: 5,
    }
  }
  if (streak >= 14) {
    return {
      fontSize: 48,
      color: '#9333ea',
      glow: 'drop-shadow(0 0 8px #9333ea)',
      level: 4,
    }
  }
  if (streak >= 7) {
    return {
      fontSize: 40,
      color: '#dc2626',
      glow: 'drop-shadow(0 0 6px #dc2626)',
      level: 3,
    }
  }
  if (streak >= 4) {
    return {
      fontSize: 32,
      color: '#ea580c',
      glow: 'drop-shadow(0 0 4px #ea580c)',
      level: 2,
    }
  }
  return {
    fontSize: 24,
    color: '#f97316',
    glow: 'drop-shadow(0 0 2px #f97316)',
    level: 1,
  }
}

function getFlameLevel(streak: number): number {
  if (streak >= 30) return 5
  if (streak >= 14) return 4
  if (streak >= 7) return 3
  if (streak >= 4) return 2
  return 1
}

export function StreakFlame({ streak }: StreakFlameProps) {
  if (streak < 1) return null

  const config = getFlameConfig(streak)
  const [pulsing, setPulsing] = useState(false)
  const prevLevel = useRef(getFlameLevel(streak))

  useEffect(() => {
    const currentLevel = getFlameLevel(streak)
    if (currentLevel > prevLevel.current) {
      setPulsing(true)
      const timer = setTimeout(() => setPulsing(false), 200)
      prevLevel.current = currentLevel
      return () => clearTimeout(timer)
    }
    prevLevel.current = currentLevel
  }, [streak])

  return (
    <span
      className="relative inline-flex items-center justify-center select-none"
      style={{
        fontSize: `${config.fontSize}px`,
        filter: config.glow,
        animation: pulsing ? 'flame-pulse 0.2s ease-out' : undefined,
      }}
      title={`连续打卡 ${streak} 天`}
    >
      🔥
      <span
        className="absolute inset-0 flex items-center justify-center text-white font-bold pointer-events-none"
        style={{
          fontSize: `${Math.round(config.fontSize * 0.4)}px`,
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          lineHeight: 1,
        }}
      >
        {streak}
      </span>
    </span>
  )
}
