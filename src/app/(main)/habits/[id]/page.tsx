'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { GlobalSnackbar } from '@/components/global-snackbar'
import { priorityColor, priorityBarColor, priorityLabel } from '@/lib/priority'

interface HabitDetail {
  id: string
  name: string
  description: string
  type: string
  status: string
  priority: string
  frequency: string
  startDate: string
  reminderTime: string
  currentStreak: number
  longestStreak: number
  totalCheckins: number
  checkedInToday: boolean
}

interface CelebrationAchievement {
  name: string
  requiredDays: number
}

function frequencyLabel(f: string) {
  if (f === 'DAILY') return '每日'
  if (f === 'WEEKDAYS') return '工作日'
  if (f === 'WEEKLY') return '每周'
  if (f === 'ONCE') return '一次性'
  return f
}

export default function HabitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [habit, setHabit] = useState<HabitDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editReminder, setEditReminder] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationAchievement, setCelebrationAchievement] = useState<CelebrationAchievement | null>(null)
  const [checkinAnimating, setCheckinAnimating] = useState(false)
  const [snackbar, setSnackbar] = useState<{message: string; type: 'success' | 'delete'} | null>(null)

  const fetchHabit = useCallback(async () => {
    const res = await fetch(`/api/habits/${params.id}`)
    if (res.ok) {
      const data = await res.json()
      setHabit(data)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }, [params.id, router])

  useEffect(() => {
    fetchHabit()
  }, [fetchHabit])

  const handleCheckin = async () => {
    setCheckinAnimating(true)
    const res = await fetch(`/api/habits/${params.id}/checkin`, {
      method: 'POST',
    })
    if (res.ok) {
      const data = await res.json()
      if (data.taskCompleted) {
        setSnackbar({ message: '任务已完成', type: 'success' })
      } else {
        setSnackbar({ message: `连续打卡 ${data.currentStreak} 天`, type: 'success' })
      }
      if (data.newAchievements?.length > 0) {
        const latest = data.newAchievements[data.newAchievements.length - 1]
        setCelebrationAchievement(latest)
        setShowCelebration(true)
      }
      fetchHabit()
    } else {
      const err = await res.json()
      setSnackbar({ message: err.error || '打卡失败', type: 'delete' })
    }
    setTimeout(() => setCheckinAnimating(false), 800)
  }

  const handleEdit = async () => {
    const res = await fetch(`/api/habits/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName,
        description: editDesc,
        reminderTime: editReminder,
      }),
    })
    if (res.ok) {
      setSnackbar({ message: '已更新', type: 'success' })
      setEditOpen(false)
      fetchHabit()
    }
  }

  const handleDelete = async () => {
    const res = await fetch(`/api/habits/${params.id}`, { method: 'DELETE' })
    if (res.ok) {
      setSnackbar({ message: '已删除', type: 'delete' })
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <p className="text-muted-foreground text-center">加载中...</p>
      </div>
    )
  }

  if (!habit) return null

  const isTask = habit.type === 'TASK'
  const isCompleted = habit.status === 'COMPLETED'
  const pColor = priorityColor(habit.priority)
  const pLabel = priorityLabel(habit.priority)
  const barColor = priorityBarColor(habit.priority)

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="flex rounded-xl border border-border bg-card overflow-hidden">
        <div className={`w-1 shrink-0 ${barColor}`} />
        <div className="flex-1">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className={`text-xl ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {habit.name}
                  </CardTitle>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                    style={{ color: pColor, borderColor: pColor, opacity: 0.8 }}
                  >
                    {pLabel}
                  </span>
                  <Badge variant="secondary">
                    {isTask ? '任务' : frequencyLabel(habit.frequency)}
                  </Badge>
                  {isCompleted && (
                    <span className="text-emerald-500 text-lg">✅</span>
                  )}
                </div>
                <Button
                  onClick={() => {
                    setEditName(habit.name)
                    setEditDesc(habit.description)
                    setEditReminder(habit.reminderTime)
                    setEditOpen(true)
                  }}
                  variant="ghost"
                  size="sm"
                >
                  编辑
                </Button>
              </div>
              {habit.description && (
                <p className="text-muted-foreground text-sm mt-1">{habit.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {isTask ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {isCompleted ? '已完成' : '进行中'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">状态</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {habit.totalCheckins}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">完成次数</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {habit.currentStreak}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">当前连续</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {habit.longestStreak}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">历史最长</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {habit.totalCheckins}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">总打卡次数</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {habit.startDate}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">开始日期</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleCheckin}
                  disabled={isCompleted || (isTask ? false : habit.checkedInToday) || checkinAnimating}
                  className="flex-1 active:scale-90 transition-transform duration-150"
                  size="lg"
                >
                  {checkinAnimating ? (
                    <span style={{ animation: 'pop-bounce 0.4s ease-out' }}>✓</span>
                  ) : isCompleted ? (
                    '已完成 ✅'
                  ) : isTask ? (
                    '完成任务'
                  ) : habit.checkedInToday ? (
                    '今日已完成 ✅'
                  ) : (
                    '完成打卡'
                  )}
                </Button>
                <Button
                  onClick={() => setDeleteOpen(true)}
                  variant="outline"
                  size="lg"
                >
                  删除
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑{isTask ? '任务' : '习惯'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>名称</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
            {!isTask && (
              <div className="space-y-2">
                <Label>提醒时间</Label>
                <Input
                  type="time"
                  value={editReminder}
                  onChange={(e) => setEditReminder(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEdit}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除{isTask ? '任务' : '习惯'}</DialogTitle>
            <DialogDescription>
              确定要删除「{habit.name}」吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CelebrationModal
        open={showCelebration}
        onOpenChange={setShowCelebration}
        achievement={celebrationAchievement}
      />

      {snackbar && (
        <GlobalSnackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  )
}
