'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useAppStore } from '@/store/use-app-store'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const taskSchema = z.object({
  title: z.string().min(1, 'Judul tugas wajib diisi'),
  description: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().optional()
})

type TaskForm = z.infer<typeof taskSchema>

export function CreateTaskDialog() {
  const {
    createTaskOpen,
    setCreateTaskOpen,
    createTaskProjectId,
    createTaskStatus,
    triggerRefresh
  } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [assignedTo, setAssignedTo] = useState<string>('')

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema)
  })

  useEffect(() => {
    if (createTaskOpen) {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setUsers(data)
        })
        .catch(() => {})
    }
  }, [createTaskOpen])

  const onSubmit = async (data: TaskForm) => {
    if (!createTaskProjectId) return
    setLoading(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          projectId: createTaskProjectId,
          status: createTaskStatus,
          assignedTo: assignedTo || undefined,
          dueDate: data.dueDate || undefined
        })
      })
      if (res.ok) {
        toast.success('Tugas berhasil dibuat')
        reset()
        setAssignedTo('')
        setCreateTaskOpen(false)
        triggerRefresh()
      } else {
        toast.error('Gagal membuat tugas')
      }
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Gagal membuat tugas')
    }
    setLoading(false)
  }

  return (
    <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tugas Baru</DialogTitle>
          <DialogDescription>
            Tambahkan tugas baru ke dalam proyek.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Judul Tugas</Label>
            <Input
              id="task-title"
              placeholder="Contoh: Desain halaman login"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">Deskripsi</Label>
            <Textarea
              id="task-desc"
              placeholder="Jelaskan tugas ini..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioritas</Label>
              <Select
                defaultValue="MEDIUM"
                onValueChange={(val) => setValue('priority', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih prioritas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Rendah</SelectItem>
                  <SelectItem value="MEDIUM">Sedang</SelectItem>
                  <SelectItem value="HIGH">Tinggi</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due">Deadline</Label>
              <Input
                id="task-due"
                type="date"
                {...register('dueDate')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign ke</Label>
            <Select
              value={assignedTo}
              onValueChange={setAssignedTo}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih anggota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateTaskOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Tugas
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
