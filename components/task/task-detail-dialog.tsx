'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/use-app-store'
import {
  CheckCircle2,
  Circle,
  Plus,
  Send,
  Calendar,
  User,
  Loader2,
  Trash2
} from 'lucide-react'
import type { TaskWithDetails } from '@/types'

const statusLabels: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'Sedang Dikerjakan',
  DONE: 'Selesai'
}

const priorityLabels: Record<string, string> = {
  LOW: 'Rendah',
  MEDIUM: 'Sedang',
  HIGH: 'Tinggi',
  URGENT: 'Urgent'
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700'
}

export function TaskDetailDialog() {
  const { selectedTaskId, setSelectedTaskId, triggerRefresh } = useAppStore()
  const [task, setTask] = useState<TaskWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchTask = useCallback(async () => {
    if (!selectedTaskId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${selectedTaskId}`)
      if (res.ok) {
        const data = await res.json()
        setTask(data)
      }
    } catch (error) {
      console.error('Failed to fetch task:', error)
    }
    setLoading(false)
  }, [selectedTaskId])

  useEffect(() => {
    if (selectedTaskId) {
      fetchTask()
    } else {
      setTask(null)
    }
  }, [selectedTaskId, fetchTask])

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })
      fetchTask()
    } catch (error) {
      console.error('Failed to toggle subtask:', error)
    }
  }

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !selectedTaskId) return
    setSubmitting(true)
    try {
      await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newSubtask, taskId: selectedTaskId })
      })
      setNewSubtask('')
      fetchTask()
    } catch (error) {
      console.error('Failed to add subtask:', error)
    }
    setSubmitting(false)
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await fetch(`/api/subtasks/${subtaskId}`, { method: 'DELETE' })
      fetchTask()
    } catch (error) {
      console.error('Failed to delete subtask:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTaskId) return
    setSubmitting(true)
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, taskId: selectedTaskId })
      })
      setNewComment('')
      fetchTask()
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
    setSubmitting(false)
  }

  const completedSubtasks = task?.subtasks?.filter(s => s.completed).length ?? 0
  const totalSubtasks = task?.subtasks?.length ?? 0

  return (
    <Dialog
      open={!!selectedTaskId}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedTaskId(null)
          triggerRefresh()
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : task ? (
          <ScrollArea className="max-h-[85vh]">
            <div className="p-6 space-y-6">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <DialogTitle className="text-xl">{task.title}</DialogTitle>
                    <DialogDescription>
                      {task.project?.name}
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {statusLabels[task.status] || task.status}
                    </Badge>
                    <Badge className={priorityColors[task.priority]}>
                      {priorityLabels[task.priority] || task.priority}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              {/* Task Description */}
              {task.description && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Deskripsi</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                {task.assignee && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{task.assignee.name}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(task.dueDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Subtasks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">
                    Subtask ({completedSubtasks}/{totalSubtasks})
                  </h4>
                </div>

                {totalSubtasks > 0 && (
                  <div className="w-full bg-secondary rounded-full h-1.5 mb-3">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{
                        width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`
                      }}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  {task.subtasks?.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 group p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <button
                        onClick={() => handleToggleSubtask(subtask.id, subtask.completed)}
                        className="flex-shrink-0"
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          subtask.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {subtask.title}
                      </span>
                      <button
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Input
                      placeholder="Tambah subtask..."
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSubtask()
                        }
                      }}
                      className="h-9"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddSubtask}
                      disabled={submitting || !newSubtask.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Comments */}
              <div>
                <h4 className="text-sm font-medium mb-3">
                  Komentar ({task.comments?.length || 0})
                </h4>
                <div className="space-y-3">
                  {task.comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {comment.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-accent/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 items-end">
                    <Input
                      placeholder="Tulis komentar..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleAddComment()
                        }
                      }}
                      className="h-9"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={submitting || !newComment.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Tugas tidak ditemukan</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
