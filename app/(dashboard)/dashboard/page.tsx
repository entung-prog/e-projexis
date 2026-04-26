'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/use-app-store'
import {
  FolderKanban,
  CheckCircle2,
  Users,
  Plus,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity
} from 'lucide-react'

interface DashboardStats {
  totalProjects: number
  totalTasks: number
  completedTasks: number
  teamMembers: number
}

interface ActivityItem {
  id: string
  message: string
  createdAt: string
}

interface ProjectPreview {
  id: string
  name: string
  color: string
  description?: string
  tasks: { id: string; status: string }[]
  members: { user: { name: string } }[]
  owner: { name: string }
}

export default function DashboardPage() {
  const { setCreateProjectOpen, refreshKey } = useAppStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  })
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [projects, setProjects] = useState<ProjectPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes, projectsRes] = await Promise.allSettled([
          fetch('/api/dashboard/stats'),
          fetch('/api/activity?limit=10'),
          fetch('/api/projects')
        ])

        if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
          setStats(await statsRes.value.json())
        }
        if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
          setActivities(await activityRes.value.json())
        }
        if (projectsRes.status === 'fulfilled' && projectsRes.value.ok) {
          setProjects(await projectsRes.value.json())
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      }
      setLoading(false)
    }
    fetchData()
  }, [refreshKey])

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0

  const statCards = [
    {
      title: 'Total Proyek',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
      trend: '+2 bulan ini'
    },
    {
      title: 'Total Tugas',
      value: stats.totalTasks,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      trend: `${stats.totalTasks - stats.completedTasks} aktif`
    },
    {
      title: 'Tugas Selesai',
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      trend: `${completionRate}% selesai`
    },
    {
      title: 'Anggota Tim',
      value: stats.teamMembers,
      icon: Users,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      trend: 'Aktif'
    }
  ]

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHour = Math.floor(diffMs / 3600000)
    const diffDay = Math.floor(diffMs / 86400000)
    if (diffMin < 1) return 'Baru saja'
    if (diffMin < 60) return `${diffMin} menit lalu`
    if (diffHour < 24) return `${diffHour} jam lalu`
    return `${diffDay} hari lalu`
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang kembali! Berikut ringkasan proyek Anda.
          </p>
        </div>
        <Button
          onClick={() => setCreateProjectOpen(true)}
          className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
        >
          <Plus className="mr-2 h-4 w-4" />
          Proyek Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl md:text-3xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion Progress */}
      <Card className="border-border/50">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Progress Keseluruhan</h3>
            <span className="text-2xl font-bold text-primary">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {stats.completedTasks} dari {stats.totalTasks} tugas telah diselesaikan
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Projects */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Proyek Terbaru</h3>
            <Link href="/proyek">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Lihat semua
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <Card className="border-border/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold mb-1">Belum ada proyek</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Mulai dengan membuat proyek pertama Anda
                </p>
                <Button onClick={() => setCreateProjectOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Proyek
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map((project) => {
                const done = project.tasks.filter(t => t.status === 'DONE').length
                const total = project.tasks.length
                const progress = total > 0 ? Math.round((done / total) * 100) : 0

                return (
                  <Link key={project.id} href={`/proyek/${project.id}`}>
                    <Card className="hover:shadow-md border-border/50 transition-all duration-200 cursor-pointer group">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                              {project.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress value={progress} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
                              {progress}%
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex-shrink-0">
                          {done}/{total}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Aktivitas Terbaru</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>

          <Card className="border-border/50">
            <CardContent className="p-4">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.slice(0, 8).map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="relative flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        {index < activities.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm leading-relaxed">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatTimeAgo(activity.createdAt)}
                        </p>
                      </div>
                    </div>
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