import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { secret, email, password, name } = await request.json()

    // Verify seed secret
    const seedSecret = process.env.SEED_SECRET
    if (!seedSecret || secret !== seedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid seed secret' },
        { status: 401 }
      )
    }

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if any admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      return NextResponse.json(
        {
          message: 'Admin user already exists',
          admin: {
            id: existingAdmin.id,
            name: existingAdmin.name,
            email: existingAdmin.email,
            role: existingAdmin.role
          }
        },
        { status: 200 }
      )
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Promote existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      })

      return NextResponse.json({
        message: 'Existing user promoted to admin',
        admin: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      })
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 12)

    const admin = await prisma.user.create({
      data: {
        name: name || 'Admin',
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        message: `Admin user "${admin.name}" created via seed`,
        userId: admin.id
      }
    })

    return NextResponse.json({
      message: 'Admin user created successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
