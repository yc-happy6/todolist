'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface MilestoneInfo {
  name: string
  requiredDays: number
}

const MILESTONE_CONFIG: Record<number, { emoji: string; gradient: string; title: string }> = {
  3: { emoji: '🌱', gradient: 'from-green-400 to-emerald-500', title: '坚持新手' },
  7: { emoji: '⭐', gradient: 'from-amber-400 to-orange-500', title: '习惯养成者' },
  30: { emoji: '🏅', gradient: 'from-blue-400 to-indigo-500', title: '高度自律' },
  100: { emoji: '👑', gradient: 'from-purple-400 to-pink-500', title: '长期主义者' },
}

interface CelebrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  achievement: MilestoneInfo | null
}

export function CelebrationModal({ open, onOpenChange, achievement }: CelebrationModalProps) {
  if (!achievement) return null

  const config = MILESTONE_CONFIG[achievement.requiredDays] || {
    emoji: '🎉',
    gradient: 'from-stone-400 to-stone-500',
    title: achievement.name,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="sr-only">{achievement.name}</DialogTitle>
          <DialogDescription className="sr-only">
            连续打卡 {achievement.requiredDays} 天成就
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div
            className={`mx-auto size-24 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}
          >
            <span className="text-5xl">{config.emoji}</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">太棒了！</h2>
            <p className="text-muted-foreground">
              你已连续坚持 <span className="font-bold text-foreground">{achievement.requiredDays}</span> 天
            </p>
            <div
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${config.gradient}`}
            >
              🏆 {achievement.name}
            </div>
          </div>
        </div>

        <DialogFooter className="justify-center">
          <Button onClick={() => onOpenChange(false)} size="lg">
            继续加油
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
