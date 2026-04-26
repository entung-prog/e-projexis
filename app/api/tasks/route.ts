import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Check if user has access to this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        subtasks: true,
        comments: { include: { user: { select: { id: true, name: true } } } }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { title, description, projectId, status, priority, assignedTo, dueDate } = await request.json()

    // Check if user has access to this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get the highest order for this status
    const lastTask = await prisma.task.findFirst({
      where: { projectId, status: status || 'TODO' },
      orderBy: { order: 'desc' }
    })

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        assignedTo,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: (lastTask?.order || 0) + 1
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        subtasks: true,
        comments: { include: { user: { select: { id: true, name: true } } } }
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        message: `menambahkan tugas "${task.title}"`,
        userId,
        projectId
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}