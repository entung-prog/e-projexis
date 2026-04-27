'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/store/use-app-store'
import { toast } from 'sonner'

const projectColors = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6'
]

export function EditProjectDialog() {
  const { editProjectId, setEditProjectId, triggerRefresh } = useAppStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (editProjectId) {
      setFetching(true)
      fetch(`/api/projects/${editProjectId}`)
        .then(res => res.json())
        .then(data => {
          setName(data.name || '')
          setDescription(data.description || '')
          setColor(data.color || '#6366f1')
          setFetching(false)
        })
        .catch(() => {
          toast.error('Gagal memuat data proyek')
          setFetching(false)
        })
    }
  }, [editProjectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !editProjectId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${editProjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, color })
      })

      if (!res.ok) throw new Error('Failed')

      toast.success('Proyek berhasil diperbarui')
      triggerRefresh()
      setEditProjectId(null)
    } catch {
      toast.error('Gagal memperbarui proyek')
    }
    setLoading(false)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setEditProjectId(null)
      setName('')
      setDescription('')
      setColor('#6366f1')
    }
  }

  return (
    <Dialog open={!!editProjectId} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Proyek</DialogTitle>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Nama Proyek</Label>
              <Input
                id="edit-project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama proyek"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-project-description">Deskripsi</Label>
              <Textarea
                id="edit-project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat proyek..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Warna Proyek</Label>
              <div className="flex flex-wrap gap-2">
                {projectColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 h-8 rounded-xl transition-all duration-200 ${
                      color === c
                        ? 'ring-2 ring-offset-2 ring-primary scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleClose(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 shadow-lg shadow-primary/25"
                disabled={loading || !name.trim()}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
