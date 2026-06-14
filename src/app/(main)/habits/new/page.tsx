'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { PRIORITY_CONFIG, PRIORITY_ORDER, type Priority } from '@/lib/priority'

export default function NewHabitPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [type, setType] = useState<'HABIT' | 'TASK'>('HABIT')
  const [priority, setPriority] = useState<Priority>('P2')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const body: Record<string, string> = {
      type,
      priority,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    }

    if (type === 'HABIT') {
      body.frequency = formData.get('frequency') as string
      body.startDate = formData.get('startDate') as string
      body.reminderTime = (formData.get('reminderTime') as string) || ''
    }

    if (!body.name) {
      toast('请填写名称')
      setSubmitting(false)
      return
    }

    if (type === 'HABIT' && (!body.frequency || !body.startDate)) {
      toast('请填写必填字段')
      setSubmitting(false)
      return
    }

    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      toast(type === 'TASK' ? '任务创建成功' : '习惯创建成功')
      router.push('/dashboard')
    } else {
      const err = await res.json()
      toast(err.error || '创建失败，请重试')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-2">
        创建新{type === 'TASK' ? '任务' : '习惯'}
      </h1>
      <p className="text-muted-foreground mb-8">
        任务是一次性的，习惯是重复打卡的
      </p>

      {/* Type Selector */}
      <div className="flex bg-muted rounded-lg p-1 mb-6">
        <button
          type="button"
          onClick={() => setType('HABIT')}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
            type === 'HABIT'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          习惯
        </button>
        <button
          type="button"
          onClick={() => setType('TASK')}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
            type === 'TASK'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          任务
        </button>
      </div>

      {/* Priority Palette */}
      <div className="mb-6">
        <Label className="mb-3 block">优先级</Label>
        <div className="grid grid-cols-4 gap-3">
          {PRIORITY_ORDER.map((p) => {
            const cfg = PRIORITY_CONFIG[p]
            const selected = priority === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className="group relative aspect-square rounded-xl border-2 transition-all duration-200 hover:shadow-md flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: cfg.softBg,
                  borderColor: selected ? cfg.color : 'transparent',
                  boxShadow: selected
                    ? `0 0 0 1px ${cfg.color}, 0 4px 12px ${cfg.color}22`
                    : undefined,
                }}
              >
                {/* Hover hint */}
                <span
                  className="absolute inset-0 flex items-center justify-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: cfg.color }}
                >
                  {cfg.hint}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">
                {type === 'TASK' ? '任务名称' : '习惯名称'} *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder={type === 'TASK' ? '例如：买酱油' : '例如：学SQL'}
                required
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                name="description"
                placeholder={type === 'TASK' ? '例如：去超市买生抽' : '例如：每天30分钟'}
                maxLength={200}
              />
            </div>

            {type === 'HABIT' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="frequency">频率 *</Label>
                  <Select name="frequency" defaultValue="DAILY">
                    <SelectTrigger>
                      <SelectValue placeholder="选择频率" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">每日</SelectItem>
                      <SelectItem value="WEEKDAYS">工作日</SelectItem>
                      <SelectItem value="WEEKLY">每周</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">开始日期 *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderTime">提醒时间</Label>
                  <Input id="reminderTime" name="reminderTime" type="time" />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                取消
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting
                  ? '创建中...'
                  : `创建${type === 'TASK' ? '任务' : '习惯'}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
