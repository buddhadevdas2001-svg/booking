'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { useAuthStore } from '@/store'
import { getCurrentProfile } from '@/lib/api'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser } = useAuthStore()

    useEffect(() => {
        const supabase = createClient()
        let isMounted = true

        const syncProfile = async () => {
            const profile = await getCurrentProfile().catch(() => null)
            if (isMounted) {
                setUser(profile)
            }
        }

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                try {
                    await syncProfile()
                } catch (e) {
                    console.warn('Profile sync skipped: User record might be missing in profiles table.')
                }
            } else {
                setUser(null)
            }
        }

        init()

        // Supabase warns against awaiting other Supabase calls directly inside this callback.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            if (session?.user) {
                const fallbackName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    full_name: fallbackName,
                    phone: session.user.user_metadata?.phone,
                    role: 'customer',
                })
                window.setTimeout(() => {
                    void syncProfile()
                }, 0)
            } else {
                setUser(null)
            }
        })

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [setUser])

    return <>{children}</>
}
