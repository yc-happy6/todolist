import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { calcStreak } from '@/lib/streak'

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

