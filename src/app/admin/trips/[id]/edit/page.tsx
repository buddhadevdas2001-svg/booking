'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Loader2, Calendar, Bus, MapPin, IndianRupee, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAdminBuses, getAdminRoutes } from '@/lib/api'

type TripData = {
    id: string
    route_id: string
    bus_id: string
    departure_time: string
    arrival_time: string
    base_price: number
    status: string
}

export default function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const queryClient = useQueryClient()
    const [fetching, setFetching] = useState(true)
    const [saving, setSaving] = useState(false)
    const [timeError, setTimeError] = useState('')
    const [form, setForm] = useState({
        route_id: '',
        bus_id: '',
        departure_time: '',
        arrival_time: '',
        base_price: '',
        status: 'scheduled',
    })

    const { data: routes } = useQuery({ queryKey: ['trip-form-routes'], queryFn: () => getAdminRoutes() })
    const { data: buses } = useQuery({ queryKey: ['trip-form-buses'], queryFn: () => getAdminBuses() })

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await fetch(`/api/admin/trips/${id}`)
                if (!res.ok) throw new Error('Failed to fetch trip details')
                const data: TripData = await res.json()
                
                // Format dates for datetime-local input
                const formatForInput = (isoString: string) => {
                    const date = new Date(isoString)
                    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16)
                }

                setForm({
                    route_id: data.route_id,
                    bus_id: data.bus_id,
                    departure_time: formatForInput(data.departure_time),
                    arrival_time: formatForInput(data.arrival_time),
                    base_price: data.base_price.toString(),
                    status: data.status,
                })
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to load trip')
                router.push('/admin/trips')
            } finally {
                setFetching(false)
            }
        }

        fetchTrip()
    }, [id, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm((prev) => {
            const next = { ...prev, [name]: value }
            // Real-time validation
            if (next.departure_time && next.arrival_time) {
                if (new Date(next.arrival_time) <= new Date(next.departure_time)) {
                    setTimeError('Arrival must be after departure')
                } else {
                    setTimeError('')
                }
            }
            return next
        })
    }

    const setQuickArrivalTime = (hours: number) => {
        if (!form.departure_time) {
            toast.error('Set departure time first')
            return
        }
        const dep = new Date(form.departure_time)
        const arr = new Date(dep.getTime() + hours * 60 * 60 * 1000)
        
        // Format for datetime-local
        const offset = arr.getTimezoneOffset() * 60000
        const formatted = new Date(arr.getTime() - offset).toISOString().slice(0, 16)
        
        setForm(prev => ({ ...prev, arrival_time: formatted }))
        setTimeError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (new Date(form.arrival_time) <= new Date(form.departure_time)) {
            setTimeError('Arrival must be after departure')
            toast.error('Invalid schedule: Arrival must be after departure')
            return
        }

        setSaving(true)
        try {
            const bus = buses?.find((item) => item.id === form.bus_id)
            const res = await fetch(`/api/admin/trips/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    route_id: form.route_id,
                    bus_id: form.bus_id,
                    departure_time: new Date(form.departure_time).toISOString(),
                    arrival_time: new Date(form.arrival_time).toISOString(),
                    base_price: Number(form.base_price),
                    status: form.status,
                    total_seats: bus?.total_seats ?? null,
                }),
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.message || `Failed to update trip (${res.status})`)
            }

            // Invalidate cache to ensure the list page shows updated data
            await queryClient.invalidateQueries({ queryKey: ['admin-trips'] })

            toast.success('Trip updated successfully')
            router.push('/admin/trips')
            router.refresh()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update trip')
        } finally {
            setSaving(false)
        }
    }

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-slate-400 animate-pulse font-medium">Loading trip schedule...</p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/admin/trips" className="rounded-xl bg-slate-800 p-2 text-slate-400 transition-all hover:bg-slate-700 hover:text-white group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight text-glow">Edit Trip Schedule</h1>
                    <p className="mt-1 text-slate-400 text-sm">Update departure, arrival, pricing and assigned bus</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-8 bg-slate-900/50 backdrop-blur-xl border-slate-800/50 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-50" />
                
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="label text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                            <MapPin size={14} className="text-emerald-500" /> Assigned Route
                        </label>
                        <select required name="route_id" value={form.route_id} onChange={handleChange} className="input focus:ring-2 focus:ring-emerald-500/20 transition-all bg-slate-800/50">
                            <option value="">Select route</option>
                            {routes?.map((route) => (
                                <option key={route.id} value={route.id}>
                                    {route.origin} -&gt; {route.destination}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="label text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                            <Bus size={14} className="text-emerald-500" /> Assigned Bus
                        </label>
                        <select required name="bus_id" value={form.bus_id} onChange={handleChange} className="input focus:ring-2 focus:ring-emerald-500/20 transition-all bg-slate-800/50">
                            <option value="">Select bus</option>
                            {buses?.map((bus) => (
                                <option key={bus.id} value={bus.id}>
                                    {bus.name} ({bus.bus_type})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="label text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                            <Clock size={14} className="text-emerald-500" /> Departure Time
                        </label>
                        <input required type="datetime-local" name="departure_time" value={form.departure_time} onChange={handleChange} className="input focus:ring-2 focus:ring-emerald-500/20 transition-all bg-slate-800/50" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="label text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                                <Clock size={14} className="text-emerald-500" /> Arrival Time
                            </label>
                            <div className="flex gap-1">
                                <button type="button" onClick={() => setQuickArrivalTime(4)} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700">+4h</button>
                                <button type="button" onClick={() => setQuickArrivalTime(8)} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700">+8h</button>
                                <button type="button" onClick={() => setQuickArrivalTime(12)} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700">+12h</button>
                            </div>
                        </div>
                        <input required type="datetime-local" name="arrival_time" value={form.arrival_time} onChange={handleChange} className={`input focus:ring-2 transition-all bg-slate-800/50 ${timeError ? 'border-red-500 ring-red-500/20' : 'focus:ring-emerald-500/20'}`} />
                        {timeError && <p className="text-red-500 text-[10px] mt-1 font-bold animate-pulse">{timeError}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="label text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                            <IndianRupee size={14} className="text-emerald-500" /> Base Ticket Price
                        </label>
                        <input required type="number" min="1" name="base_price" value={form.base_price} onChange={handleChange} className="input focus:ring-2 focus:ring-emerald-500/20 transition-all bg-slate-800/50" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                        <label className="label text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
                            <Calendar size={14} className="text-emerald-500" /> Operational Status
                        </label>
                        <select name="status" value={form.status} onChange={handleChange} className="input focus:ring-2 focus:ring-emerald-500/20 transition-all bg-slate-800/50">
                            <option value="scheduled">Scheduled</option>
                            <option value="boarding">Boarding</option>
                            <option value="delayed">Delayed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-4 border-t border-slate-800/50 pt-6">
                    <button type="button" onClick={() => router.push('/admin/trips')} className="px-6 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving || !!timeError} className="btn-primary px-8 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span className="font-bold">{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
