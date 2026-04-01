import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminRequest } from '@/lib/admin-auth'

export async function GET() {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('staff')
            .select(`
              *,
              user:profiles(id, full_name, phone, avatar_url)
            `)
            .order('created_at', { ascending: false })
        if (error) throw error
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch staff'
        return NextResponse.json({ message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response
    try {
        const payload = await req.json()
        const { full_name, phone, ...staffData } = payload
        const supabase = createAdminClient()

        // Generate a fake user to store the profile info
        const fakeEmail = `staff_${Date.now()}@voyatra.local`
        const fakePassword = `Staff#${Date.now()}!${Math.random()}`
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: fakeEmail,
            password: fakePassword,
            email_confirm: true,
            user_metadata: {
                full_name,
                phone,
                role: staffData.staff_type
            }
        })

        if (authError || !authData.user) {
            console.error('SERVER STAFF AUTH ERROR:', authError)
            return NextResponse.json({ message: authError?.message || 'Failed to generate staff account' }, { status: 400 })
        }

        const userId = authData.user.id

        // Small delay to allow Postgres trigger to create the public.profiles record
        await new Promise((resolve) => setTimeout(resolve, 500))

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: full_name || 'Staff Member',
                phone: phone || null,
                role: staffData.staff_type || 'driver',
            })
            .eq('id', userId)

        if (profileError) {
            console.error('SERVER UPDATE PROFILE ERROR:', profileError)
        }
        
        const { data, error } = await supabase
            .from('staff')
            .insert({
                staff_type: staffData.staff_type,
                employee_id: staffData.employee_id,
                license_number: staffData.license_number,
                experience_years: staffData.experience_years,
                joining_date: staffData.joining_date,
                salary: staffData.salary,
                is_active: staffData.is_active,
                user_id: userId,
            })
            .select()
            .single()

        if (error) {
            console.error('SERVER STAFF INSERT ERROR:', error)
            return NextResponse.json({ 
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            }, { status: 400 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create staff'
        return NextResponse.json({ message }, { status: 500 })
    }
}
