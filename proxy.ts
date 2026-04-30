import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const protectedPaths = [
  '/dashboard',
  '/proyek',
  '/kanban',
  '/tugas',
  '/tim',
  '/analitik',
  '/kalender',
  '/profil'
]

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If logged in and on login/register page, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/proyek/:path*',
    '/kanban/:path*',
    '/tugas/:path*',
    '/tim/:path*',
    '/analitik/:path*',
    '/kalender/:path*',
    '/profil/:path*',
    '/login',
    '/register'
  ]
}
