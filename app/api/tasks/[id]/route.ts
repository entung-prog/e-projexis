import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        subtasks: true,
        comments: { 
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' }
        },
        project: { select: { id: true, name: true } }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { title, description, status, priority, assignedTo, dueDate, order } = await request.json()

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        assignedTo,
        dueDate: dueDate ? new Date(dueDate) : null,
        order
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        subtasks: true,
        comments: { include: { user: { select: { id: true, name: true } } } }
      }
    })

    // Log activity on status change
    if (status && status !== task.status) {
      const statusNames: Record<string, string> = {
        TODO: 'To Do',
        IN_PROGRESS: 'In Progress',
        DONE: 'Selesai'
      }
      await prisma.activityLog.create({
        data: {
          message: `mengubah status tugas "${updatedTask.title}" ke ${statusNames[status] || status}`,
          userId,
          projectId: task.projectId
        }
      })
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}