'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction] = useActionState(loginAction, {
    success: false,
    error: '',
  })

  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard')
    }
  }, [state?.success, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <Card className="w-full max-w-md mx-4 shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 size-12 rounded-xl bg-black flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <CardTitle className="text-2xl font-bold">Focus Habit</CardTitle>
          <CardDescription>登录你的账号，继续习惯养成之旅</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            {state?.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
            <Button type="submit" className="w-full">
              登录
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-stone-500">
            还没有账号？{' '}
            <Link href="/register" className="text-black font-medium hover:underline">
              立即注册
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
