'use client'

import { useState } from 'react'
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
import { useAppStore } from '@/store/use-app-store'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const projectSchema = z.object({
  name: z.string().min(1, 'Nama proyek wajib diisi'),
  description: z.string().optional()
})

type ProjectForm = z.infer<typeof projectSchema>

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4'
]

export function CreateProjectDialog() {
  const { createProjectOpen, setCreateProjectOpen, triggerRefresh } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#6366f1')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema)
  })

  const onSubmit = async (data: ProjectForm) => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, color: selectedColor })
      })
      if (res.ok) {
        toast.success('Proyek berhasil dibuat')
        reset()
        setSelectedColor('#6366f1')
        setCreateProjectOpen(false)
        triggerRefresh()
      } else {
        toast.error('Gagal membuat proyek')
      }
    } catch (error) {
      console.error('Failed to create project:', error)
      toast.error('Gagal membuat proyek')
    }
    setLoading(false)
  }

  return (
    <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proyek Baru</DialogTitle>
          <DialogDescription>
            Buat proyek baru untuk mengelola tugas tim Anda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nama Proyek</Label>
            <Input
              id="project-name"
              placeholder="Contoh: Website Redesign"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-desc">Deskripsi</Label>
            <Textarea
              id="project-desc"
              placeholder="Jelaskan proyek ini..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label>Warna Proyek</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateProjectOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Proyek
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
