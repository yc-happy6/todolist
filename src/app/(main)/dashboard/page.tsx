'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { WelcomeBanner } from '@/components/welcome-banner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CelebrationModal } from '@/components/celebration-modal'
import { toast } from 'sonner'
import { priorityLabel, priorityBarColor, priorityColor } from '@/lib/priority'

interface HabitData {
  id: string
  name: string
  description: string
  type: string
  status: string
  priority: string
  frequency: string
  currentStreak: number
  longestStreak: number
  completionRate: number
  totalCheckins: number
  checkedInToday: boolean
}

interface CelebrationAchievement {
  name: string
  requiredDays: number
}

export default function DashboardPage() {
  const [habits, setHabits] = useState<HabitData[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<HabitData | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationAchievement, setCelebrationAchievement] = useState<CelebrationAchievement | null>(null)
  const [checkinAnimatingId, setCheckinAnimatingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const removingRef = useRef<string | null>(null)

  const fetchHabits = useCallback(async () => {
    const res = await fetch('/api/habits')
    if (res.ok) {
      setHabits(await res.json())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const handleCheckin = async (habitId: string) => {
    setCheckinAnimatingId(habitId)
    const res = await fetch(`/api/habits/${habitId}/checkin`, {
      method: 'POST',
    })
    if (res.ok) {
      const data = await res.json()
      if (data.taskCompleted) {
        toast('任务已完成')
      } else {
        toast(`连续打卡 ${data.currentStreak} 天`)
      }
      if (data.newAchievements?.length > 0) {
        const latest = data.newAchievements[data.newAchievements.length - 1]
        setCelebrationAchievement(latest)
        setShowCelebration(true)
      }
      fetchHabits()
    } else {
      const err = await res.json()
      toast(err.error || '打卡失败')
    }
    setTimeout(() => setCheckinAnimatingId(null), 800)
  }

  const handleDeleteConfirm = (item: HabitData) => {
    setDeleteTarget(null)
    setRemovingId(item.id)
    removingRef.current = item.id
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    handleDeleteConfirm(deleteTarget)
  }

  const onShrinkEnd = async (itemId: string) => {
    if (removingRef.current !== itemId) return
    removingRef.current = null
    setDeleting(true)
    const res = await fetch(`/api/habits/${itemId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      const target = habits.find(h => h.id === itemId)
      if (target) toast(`已删除「${target.name}」`)
      fetchHabits()
    } else {
      toast('删除失败，请重试')
    }
    setRemovingId(null)
    setDeleting(false)
  }

  const tasks = habits.filter((h) => h.type === 'TASK')
  const habitsOnly = habits.filter((h) => h.type === 'HABIT')

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <WelcomeBanner />
        <p className="text-muted-foreground text-center">加载中...</p>
      </div>
    )
  }

  const frequencyLabel = (f: string) => {
    if (f === 'DAILY') return '每日'
    if (f === 'WEEKDAYS') return '工作日'
    if (f === 'WEEKLY') return '每周'
    return f
  }

  const renderCard = (item: HabitData) => {
    const isTask = item.type === 'TASK'
    const isCompleted = item.status === 'COMPLETED'
    const barColor = priorityBarColor(item.priority)
    const pColor = priorityColor(item.priority)
    const pLabel = priorityLabel(item.priority)
    const isRemoving = removingId === item.id
    const isCheckinAnim = checkinAnimatingId === item.id

    return (
      <div
        key={item.id}
        className={`flex rounded-xl border border-border bg-card group/card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
          isCompleted ? 'opacity-70' : ''
        } ${isRemoving ? 'animate-[shrink-out_300ms_ease-in_forwards] overflow-hidden' : ''}`}
        onAnimationEnd={() => {
          if (isRemoving) onShrinkEnd(item.id)
        }}
      >
        <div className={`w-1 shrink-0 ${barColor}`} />

        <div className="flex-1 p-5 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/habits/${item.id}`}
                  className={`font-semibold text-foreground hover:text-foreground/80 truncate ${
                    isCompleted ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {item.name}
                </Link>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                  style={{ color: pColor, borderColor: pColor, opacity: 0.8 }}
                >
                  {pLabel}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {isTask ? '任务' : frequencyLabel(item.frequency)}
                </Badge>
                {isCompleted && (
                  <span className="text-emerald-500 text-sm">✅</span>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {item.description}
                </p>
              )}
              {!isTask && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1.5">
                  <span>🔥 连续 {item.currentStreak} 天</span>
                  <span>📊 {item.completionRate}%</span>
                  <span>✅ {item.totalCheckins} 次</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 ml-4 shrink-0">
              <Button
                onClick={() => handleCheckin(item.id)}
                disabled={isCompleted || (!isTask && item.checkedInToday) || isCheckinAnim}
                variant={isCompleted || (!isTask && item.checkedInToday) ? 'ghost' : 'default'}
                size="sm"
                className="active:scale-90 transition-transform duration-150"
              >
                {isCheckinAnim ? (
                  <span style={{ animation: 'pop-bounce 0.4s ease-out' }}>✓</span>
                ) : isCompleted ? (
                  '已完成'
                ) : isTask ? (
                  '完成'
                ) : item.checkedInToday ? (
                  '已完成'
                ) : (
                  '打卡'
                )}
              </Button>
              <Button
                onClick={() => setDeleteTarget(item)}
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <WelcomeBanner />

      {habits.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              还没有习惯或任务
            </h3>
            <p className="text-muted-foreground mb-6">
              创建你的第一个习惯或任务，开始养成之旅
            </p>
            <Link href="/habits/new">
              <Button>创建习惯 / 任务</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {tasks.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">任务</h2>
              <div className="space-y-3">
                {tasks.map(renderCard)}
              </div>
            </div>
          )}

          {habitsOnly.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">习惯</h2>
              <div className="space-y-3">
                {habitsOnly.map(renderCard)}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              删除{deleteTarget?.type === 'TASK' ? '任务' : '习惯'}
            </DialogTitle>
            <DialogDescription>
              确定要删除「{deleteTarget?.name}」吗？此操作不可撤销，所有打卡记录也会一并删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CelebrationModal
        open={showCelebration}
        onOpenChange={setShowCelebration}
        achievement={celebrationAchievement}
      />
    </div>
  )
}
