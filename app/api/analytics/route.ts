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
      },
      select: { id: true }
    })

    const projectIds = projects.map(p => p.id)

    // Get all tasks from user's projects
    const allTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      select: { status: true, createdAt: true, updatedAt: true, priority: true }
    })

    const totalTasks = allTasks.length
    const todoTasks = allTasks.filter(t => t.status === 'TODO').length
    const inProgressTasks = allTasks.filter(t => t.status === 'IN_PROGRESS').length
    const doneTasks = allTasks.filter(t => t.status === 'DONE').length
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    // Tasks by priority
    const lowPriority = allTasks.filter(t => t.priority === 'LOW').length
    const mediumPriority = allTasks.filter(t => t.priority === 'MEDIUM').length
    const highPriority = allTasks.filter(t => t.priority === 'HIGH').length
    const urgentPriority = allTasks.filter(t => t.priority === 'URGENT').length

    // Weekly task completion (last 7 days)
    const now = new Date()
    const weeklyData = []
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      
      const completed = allTasks.filter(t => {
        const updated = new Date(t.updatedAt)
        return t.status === 'DONE' && updated >= dayStart && updated < dayEnd
      }).length

      const created = allTasks.filter(t => {
        const created = new Date(t.createdAt)
        return created >= dayStart && created < dayEnd
      }).length

      weeklyData.push({
        name: dayNames[date.getDay()],
        selesai: completed,
        dibuat: created
      })
    }

    // Monthly task completion (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1)

      const completed = allTasks.filter(t => {
        const updated = new Date(t.updatedAt)
        return t.status === 'DONE' && updated >= monthStart && updated < monthEnd
      }).length

      const created = allTasks.filter(t => {
        const created = new Date(t.createdAt)
        return created >= monthStart && created < monthEnd
      }).length

      monthlyData.push({
        name: monthNames[date.getMonth()],
        selesai: completed,
        dibuat: created
      })
    }

    return NextResponse.json({
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      completionRate,
      tasksByPriority: [
        { name: 'Rendah', value: lowPriority, fill: '#94a3b8' },
        { name: 'Sedang', value: mediumPriority, fill: '#eab308' },
        { name: 'Tinggi', value: highPriority, fill: '#f97316' },
        { name: 'Urgent', value: urgentPriority, fill: '#ef4444' }
      ],
      statusDistribution: [
        { name: 'To Do', value: todoTasks, fill: '#94a3b8' },
        { name: 'In Progress', value: inProgressTasks, fill: '#3b82f6' },
        { name: 'Done', value: doneTasks, fill: '#22c55e' }
      ],
      weeklyData,
      monthlyData,
      totalProjects: projects.length
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
