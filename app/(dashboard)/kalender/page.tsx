'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/use-app-store'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react'

interface CalendarTask {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string
  project: { id: string; name: string }
}

const priorityDot: Record<string, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500'
}

const statusBg: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
}

export default function CalendarPage() {
  const { setSelectedTaskId } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [loading, setLoading] = useState(true)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    // Fetch all projects first, then fetch tasks per project
    const fetchTasks = async () => {
      try {
        const projectsRes = await fetch('/api/projects')
        if (!projectsRes.ok) { setLoading(false); return }
        const projects = await projectsRes.json()

        const allTasks: CalendarTask[] = []
        for (const project of projects) {
          const tasksRes = await fetch(`/api/tasks?projectId=${project.id}`)
          if (tasksRes.ok) {
            const projectTasks = await tasksRes.json()
            for (const task of projectTasks) {
              if (task.dueDate) {
                allTasks.push({
                  id: task.id,
                  title: task.title,
                  status: task.status,
                  priority: task.priority,
                  dueDate: task.dueDate,
                  project: { id: project.id, name: project.name }
                })
              }
            }
          }
        }
        setTasks(allTasks)
      } catch (error) {
        console.error('Calendar fetch error:', error)
      }
      setLoading(false)
    }
    fetchTasks()
  }, [])

  const calendarData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const days: (number | null)[] = []

    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)

    return days
  }, [year, month])

  const getTasksForDay = (day: number) => {
    return tasks.filter(task => {
      const d = new Date(task.dueDate)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1))
  }

  const today = new Date()
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  // Upcoming tasks sorted by date
  const upcomingTasks = useMemo(() => {
    const now = new Date()
    return tasks
      .filter(t => new Date(t.dueDate) >= now && t.status !== 'DONE')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
  }, [tasks])

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.ceil((date.getTime() - now.getTime()) / 86400000)
    if (diff === 0) return 'Hari ini'
    if (diff === 1) return 'Besok'
    return `${diff} hari lagi`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-[600px] rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Kalender</h1>
          <p className="text-muted-foreground mt-1">
            Pantau deadline dan jadwal tugas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-4 min-w-[160px] text-center capitalize">
            {monthName}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => setCurrentDate(new Date())}
          >
            Hari Ini
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar Grid */}
        <Card className="lg:col-span-3 border-border/50">
          <CardContent className="p-2 md:p-4">
            <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
              {/* Day Headers */}
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <div key={day} className="p-2 text-center text-xs font-semibold text-muted-foreground bg-card">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarData.map((day, index) => {
                const dayTasks = day ? getTasksForDay(day) : []
                const isTodayCell = day ? isToday(day) : false

                return (
                  <div
                    key={index}
                    className={`min-h-[80px] md:min-h-[100px] p-1.5 bg-card transition-colors ${
                      day ? 'hover:bg-accent/30 cursor-default' : 'bg-muted/20'
                    }`}
                  >
                    {day && (
                      <div>
                        <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                          isTodayCell
                            ? 'bg-primary text-primary-foreground'
                            : ''
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {dayTasks.slice(0, 3).map((task) => (
                            <button
                              key={task.id}
                              className={`w-full text-left text-[10px] md:text-xs px-1.5 py-0.5 rounded truncate block transition-opacity hover:opacity-80 ${
                                statusBg[task.status] || 'bg-gray-100 text-gray-700'
                              }`}
                              onClick={() => setSelectedTaskId(task.id)}
                            >
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${priorityDot[task.priority] || 'bg-gray-400'}`} />
                              {task.title}
                            </button>
                          ))}
                          {dayTasks.length > 3 && (
                            <span className="text-[10px] text-muted-foreground pl-1">
                              +{dayTasks.length - 3} lagi
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks Sidebar */}
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tugas Mendatang
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-6">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Tidak ada deadline mendatang</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <button
                      key={task.id}
                      className="w-full text-left p-3 rounded-xl hover:bg-accent/50 transition-colors border border-border/50"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityDot[task.priority]}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{task.title}</h4>
                          <p className="text-xs text-muted-foreground">{task.project.name}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.dueDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                              {getDaysUntil(task.dueDate)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}