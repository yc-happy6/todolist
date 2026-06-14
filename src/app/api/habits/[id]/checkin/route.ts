import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const today = new Date().toISOString().split('T')[0]

  const habit = await prisma.habit.findUnique({
    where: { id, userId: session.user.id },
  })
  if (!habit) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const existing = await prisma.habitLog.findUnique({
    where: {
      habitId_completedDate: {
        habitId: id,
        completedDate: today,
      },
    },
  })
  if (existing) {
    return NextResponse.json({ error: '今天已经打卡过了' }, { status: 400 })
  }

  await prisma.habitLog.create({
    data: {
      habitId: id,
      userId: session.user.id,
      completedDate: today,
    },
  })

  const allLogs = await prisma.habitLog.findMany({
    where: { habitId: id },
    orderBy: { completedDate: 'desc' },
  })
  const streak = calcStreak(allLogs.map((l) => l.completedDate))

  // Check achievements
  const achievements = await prisma.achievement.findMany({
    orderBy: { requiredDays: 'asc' },
  })
  const unlockedAchievements = await prisma.userAchievement.findMany({
    where: { userId: session.user.id },
    select: { achievementId: true },
  })
  const unlockedIds = new Set(unlockedAchievements.map((ua) => ua.achievementId))

  const newAchievements: string[] = []
  for (const achievement of achievements) {
    if (!unlockedIds.has(achievement.id) && streak.current >= achievement.requiredDays) {
      await prisma.userAchievement.create({
        data: {
          userId: session.user.id,
          achievementId: achievement.id,
        },
      })
      newAchievements.push(achievement.name)
    }
  }

  return NextResponse.json({
    currentStreak: streak.current,
    longestStreak: streak.longest,
    newAchievements,
  })
}

function calcStreak(dates: string[]) {
  if (dates.length === 0) return { current: 0, longest: 0 }

  const sorted = [...new Set(dates)].sort().reverse()
  let current = 1
  let longest = 1

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (Math.round(diff) === 1) {
      current++
    } else {
      break
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const latestDate = sorted[0]
  if (latestDate !== today && latestDate !== yesterdayDate(today)) {
    current = 0
  }

  let maxStreak = 1
  let tempStreak = 1
  const allSortedAsc = [...new Set(dates)].sort()
  for (let i = 1; i < allSortedAsc.length; i++) {
    const prev = new Date(allSortedAsc[i - 1])
    const curr = new Date(allSortedAsc[i])
    const diff = (curr.getTime() - prev.getTime()) / 86400000
    if (Math.round(diff) === 1) {
      tempStreak++
      maxStreak = Math.max(maxStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }
  longest = dates.length > 0 ? Math.max(maxStreak, 1) : 0

  return { current, longest }
}

function yesterdayDate(today: string) {
  const d = new Date(today)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}
