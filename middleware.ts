import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {},
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/proyek/:path*', '/kanban/:path*', '/tugas/:path*', '/tim/:path*', '/analitik/:path*', '/kalender/:path*']
}