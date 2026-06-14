import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { calcStreak } from '@/lib/streak'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    include: {
      habitLogs: {
        where: { completedDate: today },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const result = await Promise.all(
    habits.map(async (habit) => {
      const allLogs = await prisma.habitLog.findMany({
        where: { habitId: habit.id },
        orderBy: { completedDate: 'desc' },
      })
      const streak = calcStreak(allLogs.map((l) => l.completedDate))
      const totalLogs = allLogs.length
      const daysSinceStart = Math.max(
        1,
        Math.ceil(
          (Date.now() - new Date(habit.startDate).getTime()) / 86400000
        )
      )
      const completionRate =
        daysSinceStart > 0
          ? Math.round((totalLogs / daysSinceStart) * 100)
          : 0

      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        startDate: habit.startDate,
        reminderTime: habit.reminderTime,
        currentStreak: streak.current,
        longestStreak: streak.longest,
        completionRate,
        totalCheckins: totalLogs,
        checkedInToday: habit.habitLogs.length > 0,
      }
    })
  )

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, frequency, startDate, reminderTime } = body

  if (!name || !frequency || !startDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const habit = await prisma.habit.create({
    data: {
      userId: session.user.id,
      name,
      description: description || '',
      frequency: frequency || 'DAILY',
      startDate,
      reminderTime: reminderTime || '',
    },
  })

  return NextResponse.json(habit, { status: 201 })
}

