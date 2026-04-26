'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  CheckCircle2,
  Clock,
  FolderKanban
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

interface AnalyticsData {
  totalTasks: number
  todoTasks: number
  inProgressTasks: number
  doneTasks: number
  completionRate: number
  tasksByPriority: { name: string; value: number; fill: string }[]
  statusDistribution: { name: string; value: number; fill: string }[]
  weeklyData: { name: string; selesai: number; dibuat: number }[]
  monthlyData: { name: string; selesai: number; dibuat: number }[]
  totalProjects: number
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-12 text-muted-foreground">Gagal memuat data analitik</div>
  }

  const statCards = [
    {
      title: 'Total Proyek',
      value: data.totalProjects,
      icon: FolderKanban,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50'
    },
    {
      title: 'Tingkat Penyelesaian',
      value: `${data.completionRate}%`,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50'
    },
    {
      title: 'Tugas Aktif',
      value: data.todoTasks + data.inProgressTasks,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50'
    },
    {
      title: 'Tugas Selesai',
      value: data.doneTasks,
      icon: CheckCircle2,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analitik</h1>
        <p className="text-muted-foreground mt-1">
          Pantau produktivitas dan performa tim Anda.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-border/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl md:text-3xl font-bold tabular-nums">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Bar Chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Aktivitas Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="dibuat" fill="#6366f1" radius={[4, 4, 0, 0]} name="Dibuat" />
                  <Bar dataKey="selesai" fill="#22c55e" radius={[4, 4, 0, 0]} name="Selesai" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Distribusi Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] mt-2">
              {data.totalTasks === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Belum ada data tugas
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {data.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        background: 'var(--card)'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-sm text-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Bar Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Tren Bulanan (6 Bulan Terakhir)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="dibuat" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Tugas Dibuat" />
                <Bar dataKey="selesai" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Tugas Selesai" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Distribusi Prioritas Tugas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.tasksByPriority.map((priority) => (
              <div
                key={priority.name}
                className="flex items-center gap-3 p-3 rounded-xl bg-accent/30"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: priority.fill }}
                />
                <div>
                  <p className="text-sm font-medium">{priority.name}</p>
                  <p className="text-xl font-bold tabular-nums">{priority.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}