'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function NewRoutePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        origin: '',
        destination: '',
        distance_km: '',
        estimated_duration_minutes: '',
        stops: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const stops = form.stops
                .split(',')
                .map((stop) => stop.trim())
                .filter(Boolean)
                .map((name, index) => ({ name, stop_order: index + 1 }))

            const res = await fetch('/api/admin/routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin: form.origin,
                    destination: form.destination,
                    distance_km: form.distance_km ? Number(form.distance_km) : null,
                    estimated_duration_minutes: form.estimated_duration_minutes ? Number(form.estimated_duration_minutes) : null,
                    stops,
                }),
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.message || `Failed to create route (${res.status})`)
            }
            toast.success('Route created successfully')
            router.push('/admin/routes')
            router.refresh()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to create route')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/admin/routes" className="rounded-xl bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Add New Route</h1>
                    <p className="mt-1 text-slate-400">Create a route with stops and estimated travel time</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="label">Origin</label>
                        <input required name="origin" value={form.origin} onChange={handleChange} className="input" placeholder="e.g. Kolkata" />
                    </div>
                    <div>
                        <label className="label">Destination</label>
                        <input required name="destination" value={form.destination} onChange={handleChange} className="input" placeholder="e.g. Dhaka" />
                    </div>
                    <div>
                        <label className="label">Distance (KM)</label>
                        <input name="distance_km" value={form.distance_km} onChange={handleChange} className="input" type="number" min="0" />
                    </div>
                    <div>
                        <label className="label">Estimated Duration (Minutes)</label>
                        <input
                            name="estimated_duration_minutes"
                            value={form.estimated_duration_minutes}
                            onChange={handleChange}
                            className="input"
                            type="number"
                            min="0"
                        />
                    </div>
                </div>

                <div>
                    <label className="label">Intermediate Stops</label>
                    <input
                        name="stops"
                        value={form.stops}
                        onChange={handleChange}
                        className="input"
                        placeholder="e.g. Krishnanagar, Jessore, Faridpur"
                    />
                </div>

                <div className="flex justify-end border-t border-slate-800 pt-4">
                    <button type="button" onClick={() => router.push('/admin/routes')} className="btn-outline mr-3">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                        <Save size={18} />
                        <span>{loading ? 'Saving...' : 'Save Route'}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
