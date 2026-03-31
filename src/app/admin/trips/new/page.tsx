'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Save, Calendar, Clock, MapPin, IndianRupee, Bus, LayoutGrid } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { getAdminBuses, getAdminRoutes } from '@/lib/api'

export default function NewTripPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const bus = buses?.find((item) => item.id === form.bus_id)
            const res = await fetch('/api/admin/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    route_id: form.route_id,
                    bus_id: form.bus_id,
                    departure_time: form.departure_time,
                    arrival_time: form.arrival_time,
                    base_price: Number(form.base_price),
                    status: form.status,
                    total_seats: bus?.total_seats ?? null,
                    available_seats: bus?.total_seats ?? null,
                }),
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.message || `Failed to schedule trip (${res.status})`)
            }
            toast.success('Trip scheduled successfully')
            router.push('/admin/trips')
            router.refresh()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to schedule trip')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/admin/trips" className="rounded-xl bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Schedule New Trip</h1>
                    <p className="mt-1 text-slate-400">Attach a bus to a route and publish a departure.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="label">Route</label>
                        <select required name="route_id" value={form.route_id} onChange={handleChange} className="input">
                            <option value="">Select route</option>
                            {routes?.map((route) => (
                                <option key={route.id} value={route.id}>
                                    {route.origin} -&gt; {route.destination}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Bus</label>
                        <select required name="bus_id" value={form.bus_id} onChange={handleChange} className="input">
                            <option value="">Select bus</option>
                            {buses?.map((bus) => (
                                <option key={bus.id} value={bus.id}>
                                    {bus.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Departure Time</label>
                        <input required type="datetime-local" name="departure_time" value={form.departure_time} onChange={handleChange} className="input" />
                    </div>
                    <div>
                        <label className="label">Arrival Time</label>
                        <input required type="datetime-local" name="arrival_time" value={form.arrival_time} onChange={handleChange} className="input" />
                    </div>
                    <div>
                        <label className="label">Base Price</label>
                        <input required type="number" min="1" name="base_price" value={form.base_price} onChange={handleChange} className="input" />
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select name="status" value={form.status} onChange={handleChange} className="input">
                            <option value="scheduled">Scheduled</option>
                            <option value="boarding">Boarding</option>
                            <option value="delayed">Delayed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end border-t border-slate-800 pt-4">
                    <button type="button" onClick={() => router.push('/admin/trips')} className="btn-outline mr-3">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                        <Save size={18} />
                        <span>{loading ? 'Saving...' : 'Save Trip'}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
