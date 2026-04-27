import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tasks/all - Get all tasks across all projects the user has access to
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const tasks = await prisma.task.findMany({
      where: {
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        subtasks: { select: { completed: true } },
        project: { select: { id: true, name: true, color: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform to match the expected format
    const result = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate?.toISOString() || null,
      assignee: task.assignee,
      subtasks: task.subtasks,
      projectName: task.project.name,
      projectColor: task.project.color,
      projectId: task.project.id
    }))

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
