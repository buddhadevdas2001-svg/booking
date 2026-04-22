import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl


    const hasSession = request.cookies.getAll().some(
        c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    )


    if (pathname.startsWith('/admin') && !hasSession) {
        return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url))
    }


    if (pathname.startsWith('/dashboard') && !hasSession) {
        return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url))
    }

    if (hasSession && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*', '/auth/:path*'],
}
