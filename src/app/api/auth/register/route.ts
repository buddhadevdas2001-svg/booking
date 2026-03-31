import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    try {
        const { email, password, full_name, phone } = await req.json()
        const supabase = createAdminClient()

        console.log('Registering user:', { email, full_name, phone })
        // 1. Create the user in Supabase Auth
        const { data, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { full_name, phone }
        })

        if (authError) {
            console.error('Auth Error during registration:', authError)
            throw authError
        }
        if (!data.user) {
            console.error('No user data returned after creation')
            throw new Error('Failed to create user')
        }

        console.log('User created in Auth successfully:', data.user.id)

        // The public.profiles record is created automatically by a database trigger (handle_new_user)
        // when a user is created in auth.users. Manual insertion here causes a conflict.

        console.log('Registration successful for:', email)

        return NextResponse.json({ 
            message: 'User created successfully',
            user: { id: data.user.id, email: data.user.email }
        })
    } catch (err: any) {
        console.error('Registration API Error (Detailed):', {
            message: err.message,
            stack: err.stack,
            error: err
        })
        return NextResponse.json(
            { message: err instanceof Error ? err.message : 'Registration failed' },
            { status: 500 }
        )
    }
}
