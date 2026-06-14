'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function NewHabitPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const body = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      frequency: formData.get('frequency') as string,
      startDate: formData.get('startDate') as string,
      reminderTime: formData.get('reminderTime') as string || '',
    }

    if (!body.name || !body.frequency || !body.startDate) {
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
      toast('习惯创建成功')
      router.push('/dashboard')
    } else {
      toast('创建失败，请重试')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-900 mb-8">创建新习惯</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">习惯名称 *</Label>
              <Input
                id="name"
                name="name"
                placeholder="例如：学SQL"
                required
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">目标描述</Label>
              <Input
                id="description"
                name="description"
                placeholder="例如：每天30分钟"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">频率 *</Label>
              <Select name="frequency" defaultValue="DAILY">
                <SelectTrigger>
                  <SelectValue placeholder="选择频率" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">每日</SelectItem>
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

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                取消
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? '创建中...' : '创建习惯'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
