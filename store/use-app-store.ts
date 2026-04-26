import { create } from 'zustand'

interface AppState {
  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // Project modals
  createProjectOpen: boolean
  setCreateProjectOpen: (open: boolean) => void
  editProjectId: string | null
  setEditProjectId: (id: string | null) => void
  deleteProjectId: string | null
  setDeleteProjectId: (id: string | null) => void

  // Task modals
  createTaskOpen: boolean
  setCreateTaskOpen: (open: boolean) => void
  createTaskProjectId: string | null
  setCreateTaskProjectId: (projectId: string | null) => void
  createTaskStatus: string
  setCreateTaskStatus: (status: string) => void
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void

  // Refresh triggers
  refreshKey: number
  triggerRefresh: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // Sidebar
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Project modals
  createProjectOpen: false,
  setCreateProjectOpen: (open) => set({ createProjectOpen: open }),
  editProjectId: null,
  setEditProjectId: (id) => set({ editProjectId: id }),
  deleteProjectId: null,
  setDeleteProjectId: (id) => set({ deleteProjectId: id }),

  // Task modals
  createTaskOpen: false,
  setCreateTaskOpen: (open) => set({ createTaskOpen: open }),
  createTaskProjectId: null,
  setCreateTaskProjectId: (projectId) => set({ createTaskProjectId: projectId }),
  createTaskStatus: 'TODO',
  setCreateTaskStatus: (status) => set({ createTaskStatus: status }),
  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  // Refresh triggers
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 }))
}))
