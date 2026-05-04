'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Bus } from '@/types/supabase'

export default function EditBusPage() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const busId = params?.id

  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [form, setForm] = useState({
    name: '',
    registration_number: '',
    bus_type: 'AC Sleeper',
    total_seats: 40,
    amenities: 'WiFi, Charging Point, Water Bottle',
  })

  useEffect(() => {
    if (!busId) return

    const fetchBus = async () => {
      setInitializing(true)
      try {
        const res = await fetch(`/api/admin/buses/${busId}`, { method: 'GET' })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message || 'Failed to load bus')
        }
        const bus = (await res.json()) as Bus

        setForm({
          name: bus.name ?? '',
          registration_number: bus.registration_number ?? '',
          bus_type: bus.bus_type ?? 'AC Sleeper',
          total_seats: bus.total_seats ?? 40,
          amenities: Array.isArray(bus.amenities) ? bus.amenities.join(', ') : (bus.amenities as string | undefined) ?? '',
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load bus')
      } finally {
        setInitializing(false)
      }
    }

    fetchBus()
  }, [busId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'total_seats' ? Number(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: value }))
  }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!busId) {
            toast.error('Invalid bus id')
            return
        }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/buses/${busId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          registration_number: form.registration_number.toUpperCase(),
          bus_type: form.bus_type,
          total_seats: Number(form.total_seats),
          amenities: form.amenities
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to update bus')
      }

      toast.success('Bus updated successfully')
      router.push('/admin/buses')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update bus')
    } finally {
      setLoading(false)
    }
  }

  if (!busId) {
    return (
      <div className="card p-6">
        <p className="text-red-400">Bus ID is not specified.</p>
        <Link href="/admin/buses" className="mt-4 btn-outline">
          Back to buses
        </Link>
      </div>
    )
  }

  if (initializing) {
    return <p className="text-slate-400">Loading bus data...</p>
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/buses" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Bus</h1>
          <p className="text-slate-400 mt-1">Update the bus details</p>
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
          <button type="button" onClick={() => router.push('/admin/buses')} className="btn-outline mr-3">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Save size={18} />
            <span>{loading ? 'Saving...' : 'Update Bus'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
