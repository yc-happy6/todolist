import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const habit = await prisma.habit.findUnique({
    where: { id, userId: session.user.id },
  })

  if (!habit) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const allLogs = await prisma.habitLog.findMany({
    where: { habitId: id },
    orderBy: { completedDate: 'desc' },
  })

  const streak = calcStreak(allLogs.map((l) => l.completedDate))
  const today = new Date().toISOString().split('T')[0]

  return NextResponse.json({
    ...habit,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    totalCheckins: allLogs.length,
    checkedInToday: allLogs.some((l) => l.completedDate === today),
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { name, description, reminderTime } = body

  const habit = await prisma.habit.findUnique({
    where: { id, userId: session.user.id },
  })
  if (!habit) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.habit.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(reminderTime !== undefined && { reminderTime }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const habit = await prisma.habit.findUnique({
    where: { id, userId: session.user.id },
  })
  if (!habit) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.habit.delete({ where: { id } })

  return NextResponse.json({ success: true })
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
