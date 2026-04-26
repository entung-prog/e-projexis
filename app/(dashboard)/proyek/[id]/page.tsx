'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/use-app-store'
import {
  Kanban,
  Plus,
  Users,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface ProjectData {
  id: string
  name: string
  description?: string
  color: string
  owner: { id: string; name: string; email: string }
  members: { user: { id: string; name: string; email: string }; role: string }[]
  tasks: {
    id: string
    title: string
    description?: string
    status: string
    priority: string
    assignee?: { id: string; name: string }
  }[]
}

const statusLabels: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Selesai'
}

const statusColors: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500'
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const {
    setCreateTaskOpen,
    setCreateTaskProjectId,
    setCreateTaskStatus,
    setDeleteProjectId,
    setSelectedTaskId,
    refreshKey
  } = useAppStore()
  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/projects/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setProject(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [params.id, refreshKey])

  const handleAddTask = () => {
    setCreateTaskProjectId(params.id as string)
    setCreateTaskStatus('TODO')
    setCreateTaskOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-60" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold">Proyek tidak ditemukan</h2>
        <p className="text-muted-foreground mt-1">Proyek ini mungkin sudah dihapus.</p>
        <Link href="/proyek">
          <Button className="mt-4">Kembali ke Proyek</Button>
        </Link>
      </div>
    )
  }

  const completedTasks = project.tasks.filter(t => t.status === 'DONE').length
  const totalTasks = project.tasks.length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const todoCount = project.tasks.filter(t => t.status === 'TODO').length
  const inProgressCount = project.tasks.filter(t => t.status === 'IN_PROGRESS').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/proyek">
            <Button variant="ghost" size="icon" className="h-9 w-9 mt-0.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{project.name}</h1>
            </div>
            {project.description && (
              <p className="text-muted-foreground mt-1 ml-6">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-12 sm:ml-0">
          <Link href={`/kanban/${project.id}`}>
            <Button className="shadow-lg shadow-primary/25">
              <Kanban className="mr-2 h-4 w-4" />
              Kanban Board
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              setDeleteProjectId(project.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{completedTasks}</p>
                <p className="text-xs text-muted-foreground">Selesai</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{inProgressCount}</p>
                <p className="text-xs text-muted-foreground">Dikerjakan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <AlertTriangle className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{todoCount}</p>
                <p className="text-xs text-muted-foreground">Belum mulai</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{project.members.length + 1}</p>
                <p className="text-xs text-muted-foreground">Anggota</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Progress Proyek</h3>
            <span className="text-2xl font-bold text-primary tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {completedTasks} dari {totalTasks} tugas selesai
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tasks */}
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Semua Tugas ({totalTasks})</CardTitle>
              <Button size="sm" onClick={handleAddTask}>
                <Plus className="mr-1 h-4 w-4" />
                Tugas Baru
              </Button>
            </CardHeader>
            <CardContent>
              {project.tasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">Belum ada tugas</p>
                  <Button size="sm" onClick={handleAddTask}>
                    <Plus className="mr-1 h-4 w-4" />
                    Tambah Tugas Pertama
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {project.tasks.map((task) => (
                    <button
                      key={task.id}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors text-left border border-border/30"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm truncate">{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <Badge className={`text-[10px] ${statusColors[task.status]}`} variant="outline">
                          {statusLabels[task.status]}
                        </Badge>
                        {task.assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {task.assignee.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Anggota ({project.members.length + 1})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Owner */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-primary/5">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {project.owner.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{project.owner.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{project.owner.email}</p>
                </div>
                <Badge className="text-[10px]">Owner</Badge>
              </div>

              {/* Members */}
              {project.members.map((member) => (
                <div key={member.user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/50 transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-sm">
                      {member.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{member.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}