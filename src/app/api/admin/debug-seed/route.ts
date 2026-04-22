import { NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seed-admin'
import { requireAdminRequest } from '@/lib/admin-auth'

export async function POST() {
    const auth = await requireAdminRequest()
    if (!auth.ok) return auth.response

    try {
        await seedDatabase()
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}
