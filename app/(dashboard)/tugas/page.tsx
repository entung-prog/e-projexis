'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useAppStore } from '@/store/use-app-store'
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ListTodo
} from 'lucide-react'

interface TaskListItem {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  assignee?: { id: string; name: string }
  subtasks: { completed: boolean }[]
  projectName: string
  projectColor: string
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

const priorityLabels: Record<string, string> = {
  LOW: 'Rendah',
  MEDIUM: 'Sedang',
  HIGH: 'Tinggi',
  URGENT: 'Urgent'
}

export default function TugasPage() {
  const { setSelectedTaskId } = useAppStore()
  const [allTasks, setAllTasks] = useState<TaskListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterPriority, setFilterPriority] = useState('ALL')

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const projectsRes = await fetch('/api/projects')
        if (!projectsRes.ok) { setLoading(false); return }
        const projects = await projectsRes.json()

        const tasks: TaskListItem[] = []
        for (const project of projects) {
          const tasksRes = await fetch(`/api/tasks?projectId=${project.id}`)
          if (tasksRes.ok) {
            const projectTasks = await tasksRes.json()
            for (const task of projectTasks) {
              tasks.push({
                ...task,
                projectName: project.name,
                projectColor: project.color
              })
            }
          }
        }
        setAllTasks(tasks)
      } catch (error) {
        console.error('Tasks fetch error:', error)
      }
      setLoading(false)
    }
    fetchTasks()
  }, [])

  const filteredTasks = allTasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || task.status === filterStatus
    const matchPriority = filterPriority === 'ALL' || task.priority === filterPriority
    return matchSearch && matchStatus && matchPriority
  })

  const todoCount = allTasks.filter(t => t.status === 'TODO').length
  const inProgressCount = allTasks.filter(t => t.status === 'IN_PROGRESS').length
  const doneCount = allTasks.filter(t => t.status === 'DONE').length

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <div className="grid gap-4 grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-10" />
        <Skeleton className="h-60" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tugas</h1>
        <p className="text-muted-foreground mt-1">
          Semua tugas dari seluruh proyek Anda.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <ListTodo className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-xl font-bold tabular-nums">{todoCount}</p>
              <p className="text-xs text-muted-foreground">To Do</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold tabular-nums">{inProgressCount}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold tabular-nums">{doneCount}</p>
              <p className="text-xs text-muted-foreground">Selesai</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari tugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="DONE">Selesai</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Prioritas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Prioritas</SelectItem>
            <SelectItem value="LOW">Rendah</SelectItem>
            <SelectItem value="MEDIUM">Sedang</SelectItem>
            <SelectItem value="HIGH">Tinggi</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {filteredTasks.length} tugas ditemukan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {search || filterStatus !== 'ALL' || filterPriority !== 'ALL'
                  ? 'Tidak ada tugas yang cocok dengan filter'
                  : 'Belum ada tugas'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors text-left border border-border/30"
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm truncate">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: task.projectColor }}
                        />
                        <span className="text-xs text-muted-foreground truncate">
                          {task.projectName}
                        </span>
                        {task.dueDate && (
                          <>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {task.subtasks.length > 0 && (
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                      </Badge>
                    )}
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
  )
}
