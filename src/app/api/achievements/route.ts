import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const achievements = await prisma.achievement.findMany({
    orderBy: { requiredDays: 'asc' },
  })

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: session.user.id },
    select: { achievementId: true, unlockedAt: true },
  })
  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
  )

  // Get current streak for progress
  const allLogs = await prisma.habitLog.findMany({
    where: { userId: session.user.id },
    orderBy: { completedDate: 'desc' },
  })
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
    const today = new Date().toISOString().split('T')[0]
    if (dates[0] !== today) {
      const y = new Date()
      y.setDate(y.getDate() - 1)
      if (dates[0] !== y.toISOString().split('T')[0]) {
        currentStreak = 0
      }
    }
  }

  const result = achievements.map((a) => ({
    id: a.id,
    name: a.name,
    requiredDays: a.requiredDays,
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) || null,
    progress: currentStreak,
  }))

  return NextResponse.json(result)
}
