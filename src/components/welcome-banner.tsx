'use client'

import { useState, useEffect } from 'react'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return '早上好'
  if (hour >= 12 && hour < 17) return '下午好'
  if (hour >= 17 && hour < 22) return '晚上好'
  return '夜深了'
}

function getTodayDate() {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

export function WelcomeBanner() {
  const [greeting, setGreeting] = useState('')
  const [todayDate, setTodayDate] = useState('')

  useEffect(() => {
    setGreeting(getGreeting())
    setTodayDate(getTodayDate())
  }, [])

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-foreground">
        {greeting || ' '}，Louis
      </h1>
      <p className="text-muted-foreground mt-1">{todayDate || ' '}</p>
    </div>
  )
}
