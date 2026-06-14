'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HeatMap } from '@/components/heatmap'
import { CalendarView } from '@/components/calendar-view'

interface Stats {
  totalCheckins: number
  currentStreak: number
  longestStreak: number
  weekRate: number
  monthRate: number
  heatmap: Record<string, number>
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1)
  const [checkedDates, setCheckedDates] = useState<Set<string>>(new Set())

  const fetchCalendar = useCallback(async (year: number, month: number) => {
    const res = await fetch(`/api/calendar?year=${year}&month=${month}`)
    if (res.ok) {
      const data = await res.json()
      setCheckedDates(new Set(data.checkedDates))
    }
  }, [])

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchCalendar(calendarYear, calendarMonth)
  }, [calendarYear, calendarMonth, fetchCalendar])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-stone-900 mb-8">数据统计</h1>
        <p className="text-stone-400 text-center">加载中...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-stone-900 mb-8">数据统计</h1>
        <p className="text-stone-400 text-center">暂无数据</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-900 mb-8">数据统计</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-stone-900">
              {stats.totalCheckins}
            </div>
            <div className="text-xs text-stone-500 mt-1">总打卡</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-stone-900">
              {stats.currentStreak}
            </div>
            <div className="text-xs text-stone-500 mt-1">当前连续</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-stone-900">
              {stats.longestStreak}
            </div>
            <div className="text-xs text-stone-500 mt-1">最长连续</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-stone-900">
              {stats.weekRate}%
            </div>
            <div className="text-xs text-stone-500 mt-1">7天完成率</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">月度打卡日历</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarView
            checkedDates={checkedDates}
            year={calendarYear}
            month={calendarMonth}
            onMonthChange={(y, m) => {
              setCalendarYear(y)
              setCalendarMonth(m)
            }}
          />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">最近30天打卡热力图</CardTitle>
        </CardHeader>
        <CardContent>
          <HeatMap data={stats.heatmap} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近7天</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1">
              <div className="flex-1">
                <div className="h-24 bg-stone-100 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute bottom-0 w-full bg-emerald-500 rounded-b-lg transition-all"
                    style={{ height: `${stats.weekRate}%` }}
                  />
                </div>
                <div className="text-center text-sm text-stone-500 mt-2">
                  完成率 {stats.weekRate}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近30天</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1">
              <div className="flex-1">
                <div className="h-24 bg-stone-100 rounded-lg relative overflow-hidden">
                  <div
                    className="absolute bottom-0 w-full bg-emerald-500 rounded-b-lg transition-all"
                    style={{ height: `${stats.monthRate}%` }}
                  />
                </div>
                <div className="text-center text-sm text-stone-500 mt-2">
                  完成率 {stats.monthRate}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
