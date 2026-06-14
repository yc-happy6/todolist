'use client'

import { useEffect, useState, useCallback } from 'react'
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

interface HabitData {
  id: string
  name: string
  description: string
  type: string
  status: string
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
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/habits/${deleteTarget.id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      toast(`已删除「${deleteTarget.name}」`)
      setDeleteTarget(null)
      fetchHabits()
    } else {
      toast('删除失败，请重试')
    }
    setDeleting(false)
  }

  const tasks = habits.filter((h) => h.type === 'TASK')
  const habitsOnly = habits.filter((h) => h.type === 'HABIT')

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <WelcomeBanner />
        <p className="text-stone-400 text-center">加载中...</p>
      </div>
    )
  }

  const frequencyLabel = (f: string) => {
    if (f === 'DAILY') return '每日'
    if (f === 'WEEKDAYS') return '工作日'
    if (f === 'WEEKLY') return '每周'
    return f
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <WelcomeBanner />

      {habits.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-lg font-semibold text-stone-700 mb-2">
              还没有习惯或任务
            </h3>
            <p className="text-stone-400 mb-6">
              创建你的第一个习惯或任务，开始养成之旅
            </p>
            <Link href="/habits/new">
              <Button>创建习惯 / 任务</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Tasks Section */}
          {tasks.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-stone-500 mb-3">任务</h2>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`hover:shadow-sm transition-shadow group/card ${
                      task.status === 'COMPLETED' ? 'opacity-70' : ''
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/habits/${task.id}`}
                              className={`font-semibold text-stone-900 hover:text-black truncate ${
                                task.status === 'COMPLETED' ? 'line-through text-stone-400' : ''
                              }`}
                            >
                              {task.name}
                            </Link>
                            <Badge variant="secondary" className="text-xs">
                              任务
                            </Badge>
                            {task.status === 'COMPLETED' && (
                              <span className="text-emerald-500 text-sm">✅</span>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-stone-500 truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 ml-4 shrink-0">
                          <Button
                            onClick={() => handleCheckin(task.id)}
                            disabled={task.status === 'COMPLETED'}
                            variant={task.status === 'COMPLETED' ? 'ghost' : 'default'}
                            size="sm"
                          >
                            {task.status === 'COMPLETED' ? '已完成' : '完成'}
                          </Button>
                          <Button
                            onClick={() => setDeleteTarget(task)}
                            variant="ghost"
                            size="icon"
                            className="size-8 text-stone-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Habits Section */}
          {habitsOnly.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-stone-500 mb-3">习惯</h2>
              <div className="space-y-3">
                {habitsOnly.map((habit) => (
                  <Card key={habit.id} className="hover:shadow-sm transition-shadow group/card">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/habits/${habit.id}`}
                              className="font-semibold text-stone-900 hover:text-black truncate"
                            >
                              {habit.name}
                            </Link>
                            <Badge variant="secondary" className="text-xs">
                              {frequencyLabel(habit.frequency)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-stone-500">
                            <span>🔥 连续 {habit.currentStreak} 天</span>
                            <span>📊 {habit.completionRate}%</span>
                            <span>✅ {habit.totalCheckins} 次</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 ml-4 shrink-0">
                          <Button
                            onClick={() => handleCheckin(habit.id)}
                            disabled={habit.checkedInToday}
                            variant={habit.checkedInToday ? 'ghost' : 'default'}
                            size="sm"
                          >
                            {habit.checkedInToday ? '已完成' : '打卡'}
                          </Button>
                          <Button
                            onClick={() => setDeleteTarget(habit)}
                            variant="ghost"
                            size="icon"
                            className="size-8 text-stone-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm Dialog */}
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

      {/* Celebration Modal */}
      <CelebrationModal
        open={showCelebration}
        onOpenChange={setShowCelebration}
        achievement={celebrationAchievement}
      />
    </div>
  )
}
