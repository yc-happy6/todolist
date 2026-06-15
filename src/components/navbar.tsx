'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/theme-switcher'

const links = [
  { href: '/dashboard', label: '今日' },
  { href: '/stats', label: '统计' },
  { href: '/achievements', label: '成就' },
]

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md shadow-sm'
          : 'bg-card/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <span className="size-7 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background text-xs font-bold">F</span>
            </span>
            <span className="hidden sm:inline">Focus Habit</span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href ||
                (link.href === '/dashboard' && pathname.startsWith('/habits'))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  } after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:bg-primary after:transition-all after:duration-300 after:w-0 after:rounded-full hover:after:w-[calc(100%-1.5rem)] hover:after:left-[0.75rem] ${
                    isActive ? 'after:w-[calc(100%-1.5rem)] after:left-[0.75rem]' : ''
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link href="/habits/new">
            <Button size="sm">+ 新建</Button>
          </Link>
          <form
            action={async () => {
              await signOut({ redirectTo: '/login' })
            }}
          >
            <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
              退出
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
