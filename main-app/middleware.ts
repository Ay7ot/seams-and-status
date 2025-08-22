import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session')
    const { pathname } = request.nextUrl

    // Allow access to all authentication pages
    const authPages = ['/login', '/signup', '/reset-password']
    const isAuthPage = authPages.some(page => pathname.startsWith(page))

    if (isAuthPage) {
        return NextResponse.next()
    }

    // If the user is not authenticated and is trying to access a protected route,
    // redirect them to the login page.
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If the user is authenticated, allow them to proceed.
    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - sw.js (service worker)
         * - manifest.json (PWA manifest)
         * - icons (PWA icons)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons).*)',
    ],
} 