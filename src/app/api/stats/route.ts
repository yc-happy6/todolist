import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { calcStreak } from '@/lib/streak'

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

  const streak = calcStreak(allLogs.map((l) => l.completedDate))

  return NextResponse.json({
    totalCheckins,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    weekRate,
    monthRate,
    heatmap,
  })
}
