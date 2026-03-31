'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store'
import { getCurrentProfile } from '@/lib/api'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser } = useAuthStore()

    useEffect(() => {
        const supabase = createClient()

        // Check active sessions and sets the user
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                try {
                    const profile = await getCurrentProfile().catch(() => null)
                    if (profile) {
                        setUser(profile)
                    }
                } catch (e) {
                    console.warn('Profile sync skipped: User record might be missing in profiles table.')
                }
            } else {
                setUser(null)
            }
        }

        init()

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await getCurrentProfile()
                if (profile) {
                    setUser(profile)
                }
            } else {
                setUser(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [setUser])

    return <>{children}</>
}
