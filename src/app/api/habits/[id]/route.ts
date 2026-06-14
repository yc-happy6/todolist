import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { calcStreak } from '@/lib/streak'

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

