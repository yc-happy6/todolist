'use client'

import { useState } from 'react'

interface CalendarViewProps {
  checkedDates: Set<string>
  year: number
  month: number
  onMonthChange: (year: number, month: number) => void
}

const DAY_HEADERS = ['日', '一', '二', '三', '四', '五', '六']
const MILESTONE_EMOJIS: Record<number, string> = {
  3: '🌱',
  7: '⭐',
  30: '🏅',
  100: '👑',
}

export function CalendarView({ checkedDates, year, month, onMonthChange }: CalendarViewProps) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1)
    onMonthChange(d.getFullYear(), d.getMonth() + 1)
  }

  const nextMonth = () => {
    const d = new Date(year, month, 1)
    onMonthChange(d.getFullYear(), d.getMonth() + 1)
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="size-8 flex items-center justify-center rounded-md hover:bg-stone-200 text-stone-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <span className="font-semibold text-stone-900">
          {year}年{month}月
        </span>
        <button
          onClick={nextMonth}
          className="size-8 flex items-center justify-center rounded-md hover:bg-stone-200 text-stone-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((label) => (
          <div
            key={label}
            className="text-center text-xs text-stone-400 py-1"
          >
            {label}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const checked = checkedDates.has(dateStr)
          const isToday = dateStr === todayStr

          return (
            <div
              key={dateStr}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                checked
                  ? 'bg-emerald-500 text-white font-medium'
                  : 'text-stone-700 hover:bg-stone-100'
              } ${isToday ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}
            >
              {day}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3 mt-4 text-xs text-stone-500 justify-center">
        <div className="flex items-center gap-1">
          <div className="size-3 rounded bg-emerald-500" />
          <span>已打卡</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-3 rounded bg-stone-100 ring-2 ring-emerald-400" />
          <span>今天</span>
        </div>
      </div>
    </div>
  )
}
