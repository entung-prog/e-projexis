import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { content, taskId } = await request.json()

    if (!content || !taskId) {
      return NextResponse.json({ error: 'Content and taskId are required' }, { status: 400 })
    }

    // Check if user has access to the task's project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
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

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        message: `menambahkan komentar pada tugas "${task.title}"`,
        userId,
        projectId: task.projectId
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
