'use client'

import { useState } from 'react'
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
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteTaskDialog() {
  const { deleteTaskId, deleteTaskTitle, setDeleteTask, triggerRefresh, setSelectedTaskId } = useAppStore()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!deleteTaskId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${deleteTaskId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success('Tugas berhasil dihapus')
        setDeleteTask(null)
        setSelectedTaskId(null)
        triggerRefresh()
      } else {
        toast.error('Gagal menghapus tugas')
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Gagal menghapus tugas')
    }
    setLoading(false)
  }

  return (
    <Dialog open={!!deleteTaskId} onOpenChange={(open) => !open && setDeleteTask(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            Hapus Tugas
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus tugas{' '}
            <span className="font-semibold text-foreground">&quot;{deleteTaskTitle}&quot;</span>?
            Tindakan ini tidak dapat dibatalkan. Semua subtask dan komentar terkait juga akan dihapus.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteTask(null)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ya, Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
