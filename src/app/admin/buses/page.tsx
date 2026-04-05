'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Bus, Plus, Search, Shield, Edit2, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Bus as BusType } from '@/types/supabase'

export default function AdminBusesPage() {
  const [search, setSearch] = useState('')

  const { data: buses = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-buses'],
    queryFn: async () => {
      const res = await fetch('/api/admin/buses')
      if (!res.ok) throw new Error('Failed to load buses')
      const data = await res.json()
      return (data || []) as BusType[]
    },
  })

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return buses
    return buses.filter(
      (b) =>
        b.name?.toLowerCase().includes(term) ||
        b.registration_number?.toLowerCase().includes(term) ||
        b.bus_type?.toLowerCase().includes(term),
    )
  }, [buses, search])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400">
            <Bus size={20} />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300/80">Fleet</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Bus Inventory</h1>
          <p className="text-slate-400">Manage vehicles, seat counts, and amenities for trips.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => refetch()}
            className="btn-secondary flex items-center gap-2"
            disabled={isFetching}
            aria-label="Refresh buses"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link href="/admin/buses/new" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Bus
          </Link>
        </div>
      </header>

      <div className="card bg-slate-900/40 border-slate-800 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, registration, or type..."
              className="input input-with-icon bg-slate-900/70 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield size={14} />
            <span>Stripe checkout ready • Live inventory</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card animate-pulse border-slate-800 bg-slate-900/40 text-white">
                <div className="h-4 w-24 rounded bg-slate-800" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-32 rounded bg-slate-800" />
                  <div className="h-3 w-20 rounded bg-slate-800" />
                </div>
              </div>
            ))
          : filtered.map((bus) => (
              <div key={bus.id} className="card border-slate-800 bg-slate-900/40 text-white shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-blue-400/80">Registration</p>
                    <p className="text-lg font-bold text-white">{bus.registration_number}</p>
                    <p className="text-sm text-slate-400">{bus.name}</p>
                  </div>
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
                    {bus.bus_type}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Total Seats</p>
                    <p className="font-semibold text-white">{bus.total_seats ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Status</p>
                    <p className="font-semibold text-emerald-400">{bus.is_active === false ? 'Inactive' : 'Active'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-1">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {(bus.amenities || []).slice(0, 6).map((amenity, idx) => (
                        <span key={idx} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                          {amenity}
                        </span>
                      ))}
                      {(bus.amenities?.length || 0) > 6 ? (
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                          +{(bus.amenities?.length || 0) - 6} more
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/buses/${bus.id}/edit`}
                    className="btn-secondary flex items-center gap-2 border-slate-700 bg-slate-800/70 text-slate-100"
                  >
                    <Edit2 size={16} />
                    Edit
                  </Link>
                </div>
              </div>
            ))}
      </div>

      {!isLoading && filtered.length === 0 ? (
        <div className="card border-slate-800 bg-slate-900/40 text-center text-slate-300">
          <p className="font-semibold text-white">No buses match “{search}”.</p>
          <p className="text-sm text-slate-400">Try a different search or add a new bus.</p>
          <div className="mt-4">
            <Link href="/admin/buses/new" className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} />
              Add your first bus
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
