'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewBusPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '',
        registration_number: '',
        bus_type: 'AC Sleeper',
        total_seats: 40,
        amenities: 'WiFi, Charging Point, Water Bottle'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                name: form.name,
                registration_number: form.registration_number.toUpperCase(),
                bus_type: form.bus_type,
                total_seats: Number(form.total_seats),
                amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean)
            }

            const res = await fetch('/api/admin/buses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.message || `Failed to add bus (${res.status})`)
            }

            toast.success('Bus added successfully')
            router.push('/admin/buses')
            router.refresh()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to add bus')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/buses" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Add New Bus</h1>
                    <p className="text-slate-400 mt-1">Register a new vehicle to your fleet</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label">Bus Name</label>
                        <input required type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Shamolly Express - 01" className="input" />
                    </div>
                    <div>
                        <label className="label">Registration Number</label>
                        <input required type="text" name="registration_number" value={form.registration_number} onChange={handleChange} placeholder="e.g. MH 01 AB 1234" className="input uppercase" />
                    </div>
                    <div>
                        <label className="label">Bus Type</label>
                        <select name="bus_type" value={form.bus_type} onChange={handleChange} className="input">
                            <option value="AC Sleeper">AC Sleeper</option>
                            <option value="Non-AC Sleeper">Non-AC Sleeper</option>
                            <option value="AC Seater">AC Seater</option>
                            <option value="Non-AC Seater">Non-AC Seater</option>
                            <option value="Multi-axle Volvo AC">Multi-axle Volvo AC</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Total Seats</label>
                        <input required type="number" name="total_seats" min="10" max="60" value={form.total_seats} onChange={handleChange} className="input" />
                    </div>
                </div>

                <div>
                    <label className="label">Amenities (Comma separated)</label>
                    <input type="text" name="amenities" value={form.amenities} onChange={handleChange} placeholder="WiFi, Blanket, Water Bottle..." className="input" />
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <button type="button" onClick={() => router.push('/admin/buses')} className="btn-outline mr-3">Cancel</button>
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                        <Save size={18} />
                        <span>{loading ? 'Saving...' : 'Save Bus'}</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
