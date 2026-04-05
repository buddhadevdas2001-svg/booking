'use client'

import { useState } from 'react'
import { Plus, Search, Bus as BusIcon, LayoutGrid, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Link from 'next/link'
import type { SeatLayout, SeatLayoutData } from '@/types/supabase'

type LayoutListItem = SeatLayout & {
    buses?: {
        name?: string
    } | null
}

type SeatLayoutApiRow = Omit<LayoutListItem, 'layout_data'> & {
    layout_data: SeatLayoutData | string
}

export default function SeatLayoutsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    const { data: layouts, isLoading, refetch } = useQuery({
        queryKey: ['seat_layouts'],
        queryFn: async () => {
            const res = await fetch('/api/admin/seat-layouts')
            if (!res.ok) throw new Error('Failed to load layouts')
            const data = await res.json()
            
            // Ensure layout_data is parsed if it comes as a string (Supabase safety)
            return ((data || []) as SeatLayoutApiRow[]).map((l) => ({
                ...l,
                layout_data: typeof l.layout_data === 'string' ? JSON.parse(l.layout_data) : l.layout_data
            })) as LayoutListItem[]
        }
    })

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this layout?')) return
        try {
            const res = await fetch(`/api/admin/seat-layouts/${id}`, {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Failed to delete layout')
            toast.success('Seat layout deleted successfully')
            refetch()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete layout')
        }
    }

    const filteredLayouts = layouts?.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Seat Layouts</h1>
                    <p className="text-slate-400 mt-1">Manage seat configurations and templates</p>
                </div>
                <Link href="/admin/layouts/new" className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    <span>Design New Layout</span>
                </Link>
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="relative max-w-sm w-full">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search layouts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input input-with-icon text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900 border-b border-slate-800 text-sm font-semibold text-slate-400">
                                <th className="px-6 py-4">Layout Name</th>
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4">Grid Size</th>
                                <th className="px-6 py-4 text-center">Total Configured Seats</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading layouts...</td></tr>
                            ) : filteredLayouts?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <LayoutGrid size={40} className="text-slate-700" />
                                            <p>No seat layouts found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLayouts?.map((layout) => (
                                    <tr key={layout.id} className="hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-900/30 flex items-center justify-center">
                                                    <LayoutGrid size={18} className="text-purple-500" />
                                                </div>
                                                <span className="font-semibold text-white">{layout.name}</span>
                                                {layout.is_template && <span className="badge badge-info text-[10px] ml-2">TEMPLATE</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {layout.buses?.name ? (
                                                <div className="flex items-center gap-2">
                                                    <BusIcon size={14} className="text-slate-500" />
                                                    <span>{layout.buses.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 italic">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="badge-ghost font-mono px-2 py-1 rounded bg-slate-800 text-xs">
                                                {layout.layout_data?.rows} x {layout.layout_data?.cols}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-white font-medium">
                                            {layout.layout_data?.seats?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDelete(layout.id)} className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-900/30 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
