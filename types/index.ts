import { User, Project, Task, Subtask, Comment, Role, TaskStatus, Priority } from '@prisma/client'

export type { User, Project, Task, Subtask, Comment, Role, TaskStatus, Priority }

export type ProjectWithMembers = Project & {
  members: { user: User; role: Role }[]
  tasks: Task[]
  owner: User
}

export type TaskWithDetails = Task & {
  assignee?: User
  subtasks: Subtask[]
  comments: (Comment & { user: User })[]
  project: Project
}