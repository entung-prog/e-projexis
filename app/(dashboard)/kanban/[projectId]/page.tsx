'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/use-app-store'
import { ArrowLeft, Plus, Calendar, GripVertical } from 'lucide-react'

interface TaskItem {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  order: number
  assignee?: { id: string; name: string }
  subtasks: { id: string; completed: boolean }[]
  comments: { id: string }[]
}

const statusColumns = [
  { id: 'TODO', title: 'To Do', emoji: '📋', color: 'border-t-slate-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', emoji: '🔄', color: 'border-t-blue-500' },
  { id: 'DONE', title: 'Selesai', emoji: '✅', color: 'border-t-emerald-500' }
]

const priorityConfig: Record<string, { dot: string; label: string }> = {
  LOW: { dot: 'bg-slate-400', label: 'Rendah' },
  MEDIUM: { dot: 'bg-yellow-500', label: 'Sedang' },
  HIGH: { dot: 'bg-orange-500', label: 'Tinggi' },
  URGENT: { dot: 'bg-red-500', label: 'Urgent' }
}

export default function KanbanPage() {
  const params = useParams()
  const {
    setCreateTaskOpen,
    setCreateTaskProjectId,
    setCreateTaskStatus,
    setSelectedTaskId,
    refreshKey
  } = useAppStore()
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [project, setProject] = useState<{ name: string; color: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!params.projectId) return
    try {
      const [projectRes, tasksRes] = await Promise.all([
        fetch(`/api/projects/${params.projectId}`),
        fetch(`/api/tasks?projectId=${params.projectId}`)
      ])
      if (projectRes.ok) {
        const p = await projectRes.json()
        setProject({ name: p.name, color: p.color })
      }
      if (tasksRes.ok) {
        setTasks(await tasksRes.json())
      }
    } catch (error) {
      console.error('Kanban fetch error:', error)
    }
    setLoading(false)
  }, [params.projectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks, refreshKey])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const newStatus = destination.droppableId
    const taskId = draggableId

    // Optimistic update
    setTasks(prev => {
      const updated = [...prev]
      const idx = updated.findIndex(t => t.id === taskId)
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], status: newStatus }
      }
      return updated
    })

    // Server update
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
    } catch {
      // Revert on error
      setTasks(prev => {
        const updated = [...prev]
        const idx = updated.findIndex(t => t.id === taskId)
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], status: source.droppableId }
        }
        return updated
      })
    }
  }

  const handleAddTask = (status: string) => {
    setCreateTaskProjectId(params.projectId as string)
    setCreateTaskStatus(status)
    setCreateTaskOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/proyek/${params.projectId}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              {project && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
              )}
              {project?.name || 'Kanban Board'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kelola tugas dengan drag & drop
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {statusColumns.map((column) => {
            const columnTasks = tasks.filter(task => task.status === column.id)

            return (
              <div key={column.id} className="flex flex-col">
                {/* Column Header */}
                <div className={`p-3 rounded-xl border-t-4 ${column.color} bg-card border border-border/50 mb-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2 text-sm">
                      <span>{column.emoji}</span>
                      {column.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs tabular-nums">
                      {columnTasks.length}
                    </Badge>
                  </div>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[150px] space-y-2.5 p-1 rounded-xl transition-colors ${
                        snapshot.isDraggingOver
                          ? 'bg-primary/5 ring-2 ring-primary/20 ring-dashed'
                          : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border-border/50 cursor-pointer transition-all duration-200 hover:shadow-md group ${
                                snapshot.isDragging
                                  ? 'rotate-2 shadow-xl ring-2 ring-primary/30'
                                  : ''
                              }`}
                              onClick={() => setSelectedTaskId(task.id)}
                            >
                              <CardContent className="p-3.5">
                                <div className="space-y-2.5">
                                  {/* Title Row */}
                                  <div className="flex items-start gap-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <h4 className="font-medium text-sm leading-snug flex-1">
                                      {task.title}
                                    </h4>
                                    <div
                                      className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                                        priorityConfig[task.priority]?.dot || 'bg-gray-400'
                                      }`}
                                      title={priorityConfig[task.priority]?.label}
                                    />
                                  </div>

                                  {/* Description preview */}
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
                                      {task.description}
                                    </p>
                                  )}

                                  {/* Footer */}
                                  <div className="flex items-center justify-between pl-6">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {task.dueDate && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Calendar className="h-3 w-3" />
                                          {new Date(task.dueDate).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short'
                                          })}
                                        </div>
                                      )}
                                      {task.subtasks.length > 0 && (
                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                                        </Badge>
                                      )}
                                      {task.comments.length > 0 && (
                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                          💬 {task.comments.length}
                                        </Badge>
                                      )}
                                    </div>

                                    {task.assignee && (
                                      <Avatar className="h-6 w-6 border border-border">
                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                          {task.assignee.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Add Task Button */}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground border border-dashed border-border/50 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all"
                        size="sm"
                        onClick={() => handleAddTask(column.id)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah tugas
                      </Button>
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}