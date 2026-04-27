'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/store/use-app-store'
import {
  Plus,
  Users,
  CheckCircle2,
  MoreVertical,
  Kanban,
  Trash2,
  ExternalLink,
  FolderKanban,
  Pencil
} from 'lucide-react'

interface ProjectItem {
  id: string
  name: string
  description?: string
  color: string
  tasks: { id: string; status: string }[]
  members: { user: { id: string; name: string } }[]
  owner: { id: string; name: string }
  createdAt: string
}

export default function ProjectsPage() {
  const { setCreateProjectOpen, setEditProjectId, setDeleteProjectId, refreshKey } = useAppStore()
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [refreshKey])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Proyek</h1>
          <p className="text-muted-foreground mt-1">
            Kelola semua proyek tim Anda.
          </p>
        </div>
        <Button
          onClick={() => setCreateProjectOpen(true)}
          className="shadow-lg shadow-primary/25"
        >
          <Plus className="mr-2 h-4 w-4" />
          Proyek Baru
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-2xl bg-primary/5 mb-4">
              <FolderKanban className="h-12 w-12 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Belum ada proyek</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              Mulai dengan membuat proyek pertama Anda untuk mengelola tugas dan tim.
            </p>
            <Button onClick={() => setCreateProjectOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Buat Proyek Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const completedTasks = project.tasks.filter(t => t.status === 'DONE').length
            const totalTasks = project.tasks.length
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

            return (
              <Card
                key={project.id}
                className="group relative overflow-hidden border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Color accent bar */}
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: project.color }}
                />

                <CardContent className="p-5 pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/proyek/${project.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/kanban/${project.id}`}>
                            <Kanban className="mr-2 h-4 w-4" />
                            Kanban Board
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditProjectId(project.id)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Proyek
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteProjectId(project.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium tabular-nums">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{completedTasks}/{totalTasks}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{project.members.length + 1}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {project.owner.name}
                    </Badge>
                  </div>
                </CardContent>

                {/* Clickable overlay for navigation */}
                <Link
                  href={`/proyek/${project.id}`}
                  className="absolute inset-0 z-0"
                >
                  <span className="sr-only">Lihat proyek {project.name}</span>
                </Link>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}