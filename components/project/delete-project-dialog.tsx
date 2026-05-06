'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/use-app-store'
import { useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteProjectDialog() {
  const { deleteProjectId, setDeleteProjectId, triggerRefresh } = useAppStore()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!deleteProjectId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${deleteProjectId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Proyek berhasil dihapus')
        setDeleteProjectId(null)
        triggerRefresh()
      } else {
        toast.error('Gagal menghapus proyek')
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast.error('Gagal menghapus proyek')
    }
    setLoading(false)
  }

  return (
    <Dialog
      open={!!deleteProjectId}
      onOpenChange={(open) => {
        if (!open) setDeleteProjectId(null)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Hapus Proyek
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus proyek ini? Semua tugas dan data
            terkait akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteProjectId(null)}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hapus Proyek
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
