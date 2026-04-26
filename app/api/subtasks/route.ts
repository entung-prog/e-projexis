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

    const { title, taskId } = await request.json()

    if (!title || !taskId) {
      return NextResponse.json({ error: 'Title and taskId are required' }, { status: 400 })
    }

    const subtask = await prisma.subtask.create({
      data: { title, taskId }
    })

    return NextResponse.json(subtask)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
