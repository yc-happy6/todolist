import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') || '')
  const month = parseInt(searchParams.get('month') || '')

  const target = new Date()
  if (!isNaN(year)) target.setFullYear(year)
  if (!isNaN(month)) target.setMonth(month - 1)

  const y = target.getFullYear()
  const m = target.getMonth()

  const firstDay = new Date(y, m, 1)
  const lastDay = new Date(y, m + 1, 0)
  const startDate = firstDay.toISOString().split('T')[0]
  const endDate = lastDay.toISOString().split('T')[0]

  const logs = await prisma.habitLog.findMany({
    where: {
      userId: session.user.id,
      completedDate: { gte: startDate, lte: endDate },
    },
    select: { completedDate: true },
  })

  const checkedDates = [...new Set(logs.map((l) => l.completedDate))]

  return NextResponse.json({ year: y, month: m + 1, checkedDates })
}
