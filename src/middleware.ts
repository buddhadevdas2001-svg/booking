import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.supabaseUrl
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.supabaseAnonKey

    if (!supabaseUrl || !supabaseAnonKey) {
        return supabaseResponse
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()
    let role: string | null = null

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()
        role = typeof profile?.role === 'string' ? profile.role : null
    }

    const { pathname } = request.nextUrl
    const isProd = process.env.NODE_ENV === 'production'

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        if (isProd && role !== 'admin' && role !== 'agent') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Protect dashboard routes for customers
    if (pathname.startsWith('/dashboard') && !user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // If user is already logged in and tries to access auth pages, redirect
    if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*', '/auth/:path*'],
}
