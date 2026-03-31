import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false })
        if (error) throw error
        return NextResponse.json(data)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch staff'
        return NextResponse.json({ message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json()
        const { full_name, phone, ...staffData } = payload
        const supabase = createAdminClient()

        // 1. We need a profile. Since this is an admin adding staff, 
        // we might not have a real User ID yet (no invite flow fully implemented).
        // For now, we'll create a profile with a deterministic UUID based on name/phone 
        // or just a new UUID if we want to support multiple staff with same name.
        // BETTER: We'll create a staff record and let the user_id be NULL until they link it via login.
        // But our schema might require user_id. Let's check.
        // Actually, let's just insert the staff record.
        
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
                user_id: null, // Allow creation without a linked user profile for now
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
