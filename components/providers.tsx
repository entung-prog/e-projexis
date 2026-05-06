'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { CreateProjectDialog } from '@/components/project/create-project-dialog'
import { EditProjectDialog } from '@/components/project/edit-project-dialog'
import { DeleteProjectDialog } from '@/components/project/delete-project-dialog'
import { CreateTaskDialog } from '@/components/task/create-task-dialog'
import { TaskDetailDialog } from '@/components/task/task-detail-dialog'
import { DeleteTaskDialog } from '@/components/task/delete-task-dialog'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          {children}
          <CreateProjectDialog />
          <EditProjectDialog />
          <DeleteProjectDialog />
          <CreateTaskDialog />
          <TaskDetailDialog />
          <DeleteTaskDialog />
          <Toaster position="bottom-right" richColors />
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}