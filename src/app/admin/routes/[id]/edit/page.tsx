'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

type RouteData = {
    id: string
    origin: string
    destination: string
    distance_km: number | null
    estimated_duration_minutes: number | null
    stops: { name: string; stop_order: number }[]
}

export default function EditRoutePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        origin: '',
        destination: '',
        distance_km: '',
        estimated_duration_minutes: '',
        stops: '',
    })

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const res = await fetch(`/api/admin/routes/${id}`)
                if (!res.ok) throw new Error('Failed to fetch route details')
                const data: RouteData = await res.json()
                
                setForm({
                    origin: data.origin,
                    destination: data.destination,
                    distance_km: data.distance_km?.toString() || '',
                    estimated_duration_minutes: data.estimated_duration_minutes?.toString() || '',
                    stops: (data.stops || []).map(s => s.name).join(', '),
                })
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to load route')
                router.push('/admin/routes')
            } finally {
                setLoading(false)
            }
        }

        fetchRoute()
    }, [id, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const stops = form.stops
                .split(',')
                .map((stop) => stop.trim())
                .filter(Boolean)
                .map((name, index) => ({ name, stop_order: index + 1 }))

            const res = await fetch(`/api/admin/routes/${id}`, {
                method: 'PUT',
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
                // Only try to parse as JSON if it's an error and we might have a message
                const body = await res.json().catch(() => ({}))
                throw new Error(body.message || `Failed to update route (${res.status})`)
            }
            toast.success('Route updated successfully')
            router.push('/admin/routes')
            router.refresh()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update route')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-slate-400 animate-pulse font-medium">Loading route data...</p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/admin/routes" className="rounded-xl bg-slate-800 p-2 text-slate-400 transition-all hover:bg-slate-700 hover:text-white group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Edit Route</h1>
                    <p className="mt-1 text-slate-400 text-sm">Modify path details, stops, and distances</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-8 bg-slate-900/50 backdrop-blur-xl border-slate-800/50 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-50" />
                
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="label text-slate-300 font-semibold text-xs uppercase tracking-wider">Origin Location</label>
                        <input required name="origin" value={form.origin} onChange={handleChange} className="input focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-800/50" placeholder="e.g. Kolkata" />
                    </div>
                    <div className="space-y-2">
                        <label className="label text-slate-300 font-semibold text-xs uppercase tracking-wider">Destination Location</label>
                        <input required name="destination" value={form.destination} onChange={handleChange} className="input focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-800/50" placeholder="e.g. Dhaka" />
                    </div>
                    <div className="space-y-2">
                        <label className="label text-slate-300 font-semibold text-xs uppercase tracking-wider">Total Distance (Kilometers)</label>
                        <input name="distance_km" value={form.distance_km} onChange={handleChange} className="input focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-800/50" type="number" min="0" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                        <label className="label text-slate-300 font-semibold text-xs uppercase tracking-wider">Estimated Duration (Minutes)</label>
                        <input
                            name="estimated_duration_minutes"
                            value={form.estimated_duration_minutes}
                            onChange={handleChange}
                            className="input focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-800/50"
                            type="number"
                            min="0"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="space-y-2 group">
                    <label className="label text-slate-300 font-semibold text-xs uppercase tracking-wider flex justify-between">
                        <span>Intermediate Boarding Points</span>
                        <span className="text-slate-500 font-normal normal-case italic">Separate with commas</span>
                    </label>
                    <input
                        name="stops"
                        value={form.stops}
                        onChange={handleChange}
                        className="input focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-800/50 py-3"
                        placeholder="e.g. Krishnanagar, Jessore, Faridpur"
                    />
                </div>

                <div className="flex justify-end gap-4 border-t border-slate-800/50 pt-6">
                    <button type="button" onClick={() => router.push('/admin/routes')} className="px-6 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className="btn-primary px-8 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span className="font-bold">{saving ? 'Updating...' : 'Update Route'}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
