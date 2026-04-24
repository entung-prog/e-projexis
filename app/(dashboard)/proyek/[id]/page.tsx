'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Kanban, Plus, Users, ArrowLeft } from 'lucide-react'
import { ProjectWithMembers } from '@/types'

export default function ProjectDetailPage() {
  const params = useParams()
  const [project, setProject] = useState<ProjectWithMembers | null>(null)
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
  }, [params.id])

  if (loading) {
    return <div>Memuat proyek...</div>
  }

  if (!project) {
    return <div>Proyek tidak ditemukan</div>
  }

  const completedTasks = project.tasks.filter(t => t.status === 'DONE').length
  const totalTasks = project.tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/proyek">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <Link href={`/kanban/${project.id}`}>
          <Button>
            <Kanban className="mr-2 h-4 w-4" />
            Kanban Board
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Project Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Proyek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Selesai</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {completedTasks} dari {totalTasks} tugas selesai
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Anggota Tim ({project.members.length + 1})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Owner */}
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {project.owner.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{project.owner.name}</p>
                  <p className="text-xs text-muted-foreground">Owner</p>
                </div>
              </div>
              
              {/* Members */}
              {project.members.map((member) => (
                <div key={member.user.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {member.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.user.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Anggota
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Tugas
              </Button>
              <Link href={`/kanban/${project.id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Kanban className="mr-2 h-4 w-4" />
                  Buka Kanban
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tugas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {project.tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada tugas dalam proyek ini</p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Tugas Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {project.tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      task.status === 'DONE' ? 'default' :
                      task.status === 'IN_PROGRESS' ? 'secondary' : 'outline'
                    }>
                      {task.status === 'TODO' ? 'To Do' :
                       task.status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                    </Badge>
                    {(task as any).assignee && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {(task as any).assignee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              {project.tasks.length > 5 && (
                <div className="text-center">
                  <Link href={`/kanban/${project.id}`}>
                    <Button variant="outline">
                      Lihat Semua Tugas ({project.tasks.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}