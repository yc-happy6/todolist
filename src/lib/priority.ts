export const PRIORITY_CONFIG = {
  P0: {
    label: 'P0 重要且紧急',
    short: 'P0',
    hint: '核心',
    color: '#FF4D4F',
    softBg: '#FFEBEE',
    barColor: 'bg-[var(--priority-p0)]',
  },
  P1: {
    label: 'P1 重要不紧急',
    short: 'P1',
    hint: '长线',
    color: '#1890FF',
    softBg: '#E3F2FD',
    barColor: 'bg-[var(--priority-p1)]',
  },
  P2: {
    label: 'P2 紧急不重要',
    short: 'P2',
    hint: '琐事',
    color: '#FFC107',
    softBg: '#FFF8E1',
    barColor: 'bg-[var(--priority-p2)]',
  },
  P3: {
    label: 'P3 不重要不紧急',
    short: 'P3',
    hint: '备忘',
    color: '#95A5A6',
    softBg: '#F5F5F5',
    barColor: 'bg-[var(--priority-p3)]',
  },
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
