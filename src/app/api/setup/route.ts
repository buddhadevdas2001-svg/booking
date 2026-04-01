import { NextResponse } from 'next/server'

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
    }

    const headers = {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
    }
    const requiredTables = ['routes', 'buses', 'trips', 'bookings', 'profiles']
    const failures: Array<{ table: string; status: number; error: string }> = []

    for (const table of requiredTables) {
        const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=id&limit=1`, { headers })
        if (!res.ok) {
            failures.push({
                table,
                status: res.status,
                error: await res.text(),
            })
        }
    }

    if (failures.length === 0) {
        return NextResponse.json({
            status: 'ok',
            message: 'Database tables exist and are accessible.',
            checked_tables: requiredTables,
            next_step: 'Now visit /seed to populate your fleet, routes, and trips.',
        })
    }

    return NextResponse.json({
        status: 'needs_setup',
        http_status: failures[0]?.status ?? 500,
        error: failures[0]?.error || 'Unknown setup error',
        failures,
        message: 'One or more required tables are missing or inaccessible. You need to run the SQL setup script.',
        instructions: [
            '1. Open the file: setup_merged.sql in your code editor.',
            '2. Copy its entire content.',
            `3. Go to: https://supabase.com/dashboard/project/${supabaseUrl.replace('https://', '').replace('.supabase.co', '')}/sql`,
            '4. Paste and RUN the SQL.',
            '5. Once completed, the home page will start working and you can visit /seed.'
        ],
    })
}
