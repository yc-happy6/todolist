'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Achievement {
  id: string
  name: string
  requiredDays: number
  unlocked: boolean
  unlockedAt: string | null
  progress: number
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/achievements')
      .then((res) => res.json())
      .then((data) => {
        setAchievements(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-stone-900 mb-8">成就</h1>
        <p className="text-stone-400 text-center">加载中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-900 mb-2">成就</h1>
      <p className="text-stone-500 mb-8">
        坚持打卡，解锁更多成就
      </p>

      <div className="space-y-3">
        {achievements.map((a) => {
          const progress = Math.min(
            Math.round((a.progress / a.requiredDays) * 100),
            100
          )
          return (
            <Card
              key={a.id}
              className={a.unlocked ? 'border-emerald-200 bg-emerald-50/50' : ''}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-10 rounded-full flex items-center justify-center text-lg ${
                        a.unlocked
                          ? 'bg-emerald-100'
                          : 'bg-stone-100 grayscale'
                      }`}
                    >
                      {a.unlocked ? '🏆' : '🔒'}
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">
                        {a.name}
                      </div>
                      <div className="text-sm text-stone-500">
                        连续坚持 {a.requiredDays} 天
                        {a.unlocked && a.unlockedAt && (
                          <span className="ml-2">
                            · {new Date(a.unlockedAt).toLocaleDateString('zh-CN')} 解锁
                          </span>
                        )}
                      </div>
                      {!a.unlocked && (
                        <div className="mt-2 w-full max-w-[200px] h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-stone-400 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={a.unlocked ? 'default' : 'secondary'}
                    className={
                      a.unlocked
                        ? 'bg-emerald-500 hover:bg-emerald-500'
                        : ''
                    }
                  >
                    {a.unlocked ? '已解锁' : `${a.progress}/${a.requiredDays}`}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
