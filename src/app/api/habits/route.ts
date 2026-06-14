import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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

  let maxStreak = 1
  let tempStreak = 1
  const allSortedDesc = [...new Set(dates)].sort()
  for (let i = 1; i < allSortedDesc.length; i++) {
    const prev = new Date(allSortedDesc[i - 1])
    const curr = new Date(allSortedDesc[i])
    const diff = (curr.getTime() - prev.getTime()) / 86400000
    if (Math.round(diff) === 1) {
      tempStreak++
      maxStreak = Math.max(maxStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }
  longest = maxStreak

  const today = new Date().toISOString().split('T')[0]
  const latestDate = sorted[0]
  if (latestDate !== today && latestDate !== yesterdayDate(today)) {
    current = 0
  }

  return { current, longest }
}

function yesterdayDate(today: string) {
  const d = new Date(today)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}
