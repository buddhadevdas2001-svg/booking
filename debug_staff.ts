import { createAdminClient } from './src/lib/supabase/admin'

async function debug() {
    const supabase = createAdminClient()
    const { data: staff, error } = await supabase
        .from('staff')
        .select(`
            id,
            employee_id,
            user_id,
            profile:profiles(full_name, phone)
        `)
    
    if (error) {
        console.error('ERROR:', error)
        return
    }

    console.log('STAFF DATABASE RECORDS:')
    console.table(staff.map(s => ({
        id: s.id,
        empId: s.employee_id,
        userId: s.user_id,
        name: (s as any).profile?.full_name || 'NULL',
        phone: (s as any).profile?.phone || 'NULL'
    })))
}

debug()
