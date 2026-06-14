interface HeatMapProps {
  data: Record<string, number>
}

function getColor(count: number): string {
  if (count === 0) return 'bg-muted'
  if (count === 1) return 'bg-emerald-200'
  if (count === 2) return 'bg-emerald-400'
  if (count === 3) return 'bg-emerald-500'
  return 'bg-emerald-600'
}

export function HeatMap({ data }: HeatMapProps) {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b))
  const maxCount = Math.max(...Object.values(data), 1)

  // Group by week
  const weeks: { date: string; count: number }[][] = []
  let currentWeek: { date: string; count: number }[] = []

  for (const [date, count] of entries) {
    const d = new Date(date)
    const dayOfWeek = d.getDay()
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push({ date, count })
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)

  const dayLabels = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="flex gap-1">
      <div className="flex flex-col gap-[3px] pr-2 pt-5">
        {dayLabels
          .filter((_, i) => i % 2 === 0)
          .map((label, i) => (
            <span key={i} className="text-[10px] text-muted-foreground leading-[14px]">
              {label}
            </span>
          ))}
      </div>
      <div className="flex gap-[3px] overflow-x-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-[14px] h-[14px] rounded-sm ${getColor(
                  day.count
                )} transition-colors`}
                title={`${day.date}: ${day.count} 次打卡`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
