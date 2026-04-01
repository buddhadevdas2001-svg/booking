'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
    ArrowLeft, Bus, Calendar, Clock, MapPin, Search,
    Shield, Award, Plus, Trash2, CheckCircle2
} from 'lucide-react'

type TripDetails = {
    id: string
    departure_time: string
    route?: { origin?: string; destination?: string }
}

type TripStaffMember = {
    id: string
    staff_id: string
    role: 'driver' | 'conductor' | string
    staff?: {
        employee_id?: string
        user?: { full_name?: string }
    }
}

type StaffMember = {
    id: string
    staff_type: 'driver' | 'conductor' | string
    employee_id?: string
    user?: { full_name?: string; phone?: string }
}

export default function AssignStaffPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState<'driver' | 'conductor'>('driver')

    const { data: trip, isLoading: tripLoading } = useQuery({
        queryKey: ['admin-trip', id],
        queryFn: async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('trips')
                .select('*, route:routes(*), bus:buses(*)')
                .eq('id', id)
                .single()
            if (error) throw error
            return data as unknown as TripDetails
        }
    })

    const { data: tripStaff = [], isLoading: tripStaffLoading } = useQuery<TripStaffMember[]>({
        queryKey: ['trip-staff', id],
        queryFn: async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('trip_staff')
                .select('*, staff:staff(*, user:profiles(full_name))')
                .eq('trip_id', id)
            if (error) throw error
            return (data || []) as unknown as TripStaffMember[]
        }
    })

    const { data: availableStaff = [], isLoading: staffLoading } = useQuery<StaffMember[]>({
        queryKey: ['available-staff'],
        queryFn: async () => {
            const res = await fetch('/api/admin/staff')
            if (!res.ok) throw new Error('Failed to fetch available staff')
            const allStaff = (await res.json()) as StaffMember[]
            return allStaff.filter(s => s.is_active !== false)
        }
    })

    const assignMutation = useMutation({
        mutationFn: async (staffId: string) => {
            const supabase = createClient()
            const { error } = await supabase.from('trip_staff').insert({
                trip_id: id,
                staff_id: staffId,
                role: selectedRole
            } as never)
            if (error) throw error
        },
        onSuccess: () => {
            toast.success('Staff assigned successfully')
            queryClient.invalidateQueries({ queryKey: ['trip-staff', id] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Failed to assign staff')
    })

    const removeMutation = useMutation({
        mutationFn: async (assignmentId: string) => {
            const supabase = createClient()
            const { error } = await supabase.from('trip_staff').delete().eq('id', assignmentId)
            if (error) throw error
        },
        onSuccess: () => {
            toast.success('Staff removed from trip')
            queryClient.invalidateQueries({ queryKey: ['trip-staff', id] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Failed to remove staff')
    })

    const filteredStaff = availableStaff.filter((s) => 
        s.staff_type === selectedRole && 
        !tripStaff.some((ts) => ts.staff_id === s.id) &&
        (s.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         s.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (tripLoading || staffLoading || tripStaffLoading) {
        return <div className="p-8 text-center text-slate-400">Loading details...</div>
    }

    if (!trip) return <div className="p-8 text-center text-red-400">Trip not found</div>

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/trips" className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="text-blue-500" />
                        Assign Trip Staff
                    </h1>
                    <p className="text-slate-400 flex items-center gap-2 text-sm mt-1">
                        {trip.route?.origin} → {trip.route?.destination} • {new Date(trip.departure_time).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Crew */}
                <div className="card">
                    <h2 className="font-bold text-lg mb-4 text-white">Current Crew</h2>
                    
                    {tripStaff.length === 0 ? (
                        <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center text-slate-500 text-sm">
                            No crew assigned to this trip yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tripStaff.map((ts) => (
                                <div key={ts.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-700 bg-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ts.role === 'driver' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {ts.role === 'driver' ? <Shield size={18} /> : <Award size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{ts.staff?.user?.full_name}</p>
                                            <p className="text-xs text-slate-400 capitalize">{ts.role} • {ts.staff?.employee_id}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeMutation.mutate(ts.id)}
                                        disabled={removeMutation.isPending}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Assign New */}
                <div className="card">
                    <h2 className="font-bold text-lg mb-4 text-white">Assign Staff</h2>
                    
                    <div className="flex gap-2 mb-4">
                        <button 
                            onClick={() => setSelectedRole('driver')}
                            className={`flex-1 py-1.5 rounded-lg text-sm font-bold border ${selectedRole === 'driver' ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                        >
                            Drivers
                        </button>
                        <button 
                            onClick={() => setSelectedRole('conductor')}
                            className={`flex-1 py-1.5 rounded-lg text-sm font-bold border ${selectedRole === 'conductor' ? 'bg-green-600 border-green-500 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                        >
                            Conductors
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search available staff..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="input pl-9 text-sm"
                        />
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {filteredStaff.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                No available {selectedRole}s found.
                            </div>
                        ) : filteredStaff.map((staff) => (
                            <div key={staff.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
                                <div>
                                    <p className="font-bold text-white text-sm">{staff.user?.full_name}</p>
                                    <p className="text-xs text-slate-400">{staff.employee_id} • {staff.user?.phone}</p>
                                </div>
                                <button
                                    onClick={() => assignMutation.mutate(staff.id)}
                                    disabled={assignMutation.isPending}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                                >
                                    <Plus size={14} /> Assign
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
