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

    // Get projects where user is owner or member
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    })

    const projectIds = projects.map(p => p.id)

    // Get tasks from user's projects
    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } }
    })

    // Get unique team members from all projects
    const teamMembers = await prisma.projectMember.findMany({
      where: { projectId: { in: projectIds } },
      include: { user: true },
      distinct: ['userId']
    })

    const stats = {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'DONE').length,
      teamMembers: teamMembers.length
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}