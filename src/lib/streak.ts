export function calcStreak(dates: string[]) {
  if (dates.length === 0) return { current: 0, longest: 0 }

  const sorted = [...new Set(dates)].sort().reverse()
  let current = 1

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
  const longest = dates.length > 0 ? Math.max(maxStreak, 1) : 0

  return { current, longest }
}

export function yesterdayDate(today: string) {
  const d = new Date(today)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}
