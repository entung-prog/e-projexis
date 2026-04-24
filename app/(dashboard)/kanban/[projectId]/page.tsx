'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Plus, Calendar, User } from 'lucide-react'
import { TaskWithDetails, TaskStatus } from '@/types'

const statusColumns = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-100' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'DONE', title: 'Done', color: 'bg-green-100' }
]

const priorityColors = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500'
}

export default function KanbanPage() {
  const params = useParams()
  const [tasks, setTasks] = useState<TaskWithDetails[]>([])
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.projectId) {
      // Fetch project details
      fetch(`/api/projects/${params.projectId}`)
        .then(res => res.json())
        .then(setProject)

      // Fetch tasks
      fetch(`/api/tasks?projectId=${params.projectId}`)
        .then(res => res.json())
        .then(data => {
          setTasks(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [params.projectId])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const newStatus = destination.droppableId as TaskStatus
    const taskId = draggableId

    // Optimistic update
    setTasks(prevTasks => {
      const newTasks = [...prevTasks]
      const taskIndex = newTasks.findIndex(t => t.id === taskId)
      if (taskIndex !== -1) {
        newTasks[taskIndex] = { ...newTasks[taskIndex], status: newStatus }
      }
      return newTasks
    })

    // Update on server
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
    } catch (error) {
      // Revert on error
      setTasks(prevTasks => {
        const newTasks = [...prevTasks]
        const taskIndex = newTasks.findIndex(t => t.id === taskId)
        if (taskIndex !== -1) {
          newTasks[taskIndex] = { ...newTasks[taskIndex], status: source.droppableId as TaskStatus }
        }
        return newTasks
      })
    }
  }

  if (loading) {
    return <div>Memuat Kanban board...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/proyek/${params.projectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {project?.name || 'Kanban Board'}
          </h1>
          <p className="text-muted-foreground">
            Kelola tugas dengan drag & drop
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tugas
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusColumns.map((column) => {
            const columnTasks = tasks.filter(task => task.status === column.id)
            
            return (
              <div key={column.id} className="space-y-4">
                <div className={`p-4 rounded-lg ${column.color}`}>
                  <h3 className="font-semibold flex items-center justify-between">
                    {column.title}
                    <Badge variant="secondary">{columnTasks.length}</Badge>
                  </h3>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] space-y-3 ${
                        snapshot.isDraggingOver ? 'bg-gray-50 rounded-lg p-2' : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-pointer hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-medium text-sm leading-tight">
                                      {task.title}
                                    </h4>
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        priorityColors[task.priority]
                                      }`}
                                      title={task.priority}
                                    />
                                  </div>

                                  {task.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {task.dueDate && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Calendar className="h-3 w-3" />
                                          {new Date(task.dueDate).toLocaleDateString('id-ID')}
                                        </div>
                                      )}
                                      {task.subtasks.length > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                                        </Badge>
                                      )}
                                    </div>

                                    {task.assignee && (
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {task.assignee.name.charAt(0)}
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
                        className="w-full justify-start text-muted-foreground"
                        size="sm"
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