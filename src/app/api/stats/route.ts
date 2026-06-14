import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allLogs = await prisma.habitLog.findMany({
    where: { userId: session.user.id },
    orderBy: { completedDate: 'desc' },
  })

  const totalCheckins = allLogs.length

  // 30-day heatmap data
  const heatmap: Record<string, number> = {}
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    heatmap[key] = 0
  }
  for (const log of allLogs) {
    if (heatmap[log.completedDate] !== undefined) {
      heatmap[log.completedDate]++
    }
  }

  // Completion rates
  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
  })

  let totalLogs7Days = 0
  let totalExpected7Days = 0
  let totalLogs30Days = 0
  let totalExpected30Days = 0

  for (const habit of habits) {
    for (const log of allLogs) {
      if (log.habitId !== habit.id) continue
      const logDate = new Date(log.completedDate)
      const diffDays = (today.getTime() - logDate.getTime()) / 86400000
      if (diffDays < 7) {
        totalLogs7Days++
      }
      if (diffDays < 30) {
        totalLogs30Days++
      }
    }
    const daysSinceStart = Math.max(
      1,
      Math.ceil((Date.now() - new Date(habit.startDate).getTime()) / 86400000)
    )
    totalExpected7Days += Math.min(7, daysSinceStart)
    totalExpected30Days += Math.min(30, daysSinceStart)
  }

  const weekRate =
    totalExpected7Days > 0
      ? Math.round((totalLogs7Days / totalExpected7Days) * 100)
      : 0
  const monthRate =
    totalExpected30Days > 0
      ? Math.round((totalLogs30Days / totalExpected30Days) * 100)
      : 0

  // Current streak
  const dates = [...new Set(allLogs.map((l) => l.completedDate))].sort().reverse()
  let currentStreak = 0
  if (dates.length > 0) {
    currentStreak = 1
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diff = (prev.getTime() - curr.getTime()) / 86400000
      if (Math.round(diff) === 1) {
        currentStreak++
      } else {
        break
      }
    }
    const todayStr = today.toISOString().split('T')[0]
    if (dates[0] !== todayStr && dates[0] !== yesterdayDate(todayStr)) {
      currentStreak = 0
    }
  }

  // Longest streak
  let longestStreak = dates.length > 0 ? 1 : 0
  let tempStreak = 1
  const sortedAsc = [...new Set(allLogs.map((l) => l.completedDate))].sort()
  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = new Date(sortedAsc[i - 1])
    const curr = new Date(sortedAsc[i])
    const diff = (curr.getTime() - prev.getTime()) / 86400000
    if (Math.round(diff) === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  return NextResponse.json({
    totalCheckins,
    currentStreak,
    longestStreak,
    weekRate,
    monthRate,
    heatmap,
  })
}

function yesterdayDate(today: string) {
  const d = new Date(today)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}
