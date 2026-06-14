export const PRIORITY_CONFIG = {
  P0: { label: 'P0 重要且紧急', short: 'P0', color: '#FF4D4F', barColor: 'bg-[var(--priority-p0)]' },
  P1: { label: 'P1 重要不紧急', short: 'P1', color: '#1890FF', barColor: 'bg-[var(--priority-p1)]' },
  P2: { label: 'P2 紧急不重要', short: 'P2', color: '#FFC107', barColor: 'bg-[var(--priority-p2)]' },
  P3: { label: 'P3 不重要不紧急', short: 'P3', color: '#95A5A6', barColor: 'bg-[var(--priority-p3)]' },
} as const

export type Priority = keyof typeof PRIORITY_CONFIG

export const PRIORITY_ORDER: Priority[] = ['P0', 'P1', 'P2', 'P3']

export function priorityLabel(p: string) {
  return PRIORITY_CONFIG[p as Priority]?.short || p
}

export function priorityBarColor(p: string) {
  return PRIORITY_CONFIG[p as Priority]?.barColor || 'bg-muted-foreground'
}

export function priorityColor(p: string) {
  return PRIORITY_CONFIG[p as Priority]?.color || '#95A5A6'
}
