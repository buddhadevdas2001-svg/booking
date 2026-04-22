'use client'

import { useState } from 'react'
import { Search, Eye, Download, Filter, Calendar, CreditCard, IndianRupee, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Payment } from '@/types/supabase'
import toast from 'react-hot-toast'

type PaymentWithDetails = Payment & {
    booking: {
        booking_reference: string
        contact_email?: string
        user?: {
            full_name?: string
        } | null
    }
}

export default function AdminPaymentsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [dateFilterDisplay, setDateFilterDisplay] = useState('')
    const [dateFilter, setDateFilter] = useState('')

    const parseDate = (value: string) => {
        const parts = value.split('/')
        if (parts.length !== 3) return ''
        const [dd, mm, yyyy] = parts.map((x) => x.trim())
        if (!dd || !mm || !yyyy || Number.isNaN(Number(dd)) || Number.isNaN(Number(mm)) || Number.isNaN(Number(yyyy))) return ''
        const day = Number(dd)
        const month = Number(mm)
        const year = Number(yyyy)
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) return ''
        return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    }

    const { data: payments, isLoading, refetch } = useQuery({
        queryKey: ['admin-payments', statusFilter, dateFilter],
        queryFn: async () => {
            const url = new URL('/api/admin/payments', window.location.origin)
            if (statusFilter !== 'all') url.searchParams.set('status', statusFilter)
            if (dateFilter) url.searchParams.set('date', dateFilter)

            const res = await fetch(url.toString())
            if (!res.ok) throw new Error('Failed to load payments')
            const data = await res.json()
            return data as PaymentWithDetails[]
        }
    })

    const filteredPayments = payments?.filter(payment =>
        payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.booking?.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.booking?.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.booking?.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'succeeded': return 'bg-green-500/20 text-green-400'
            case 'failed': return 'bg-red-500/20 text-red-400'
            case 'pending': return 'bg-yellow-500/20 text-yellow-400'
            case 'refunded': return 'bg-blue-500/20 text-blue-400'
            default: return 'bg-slate-500/20 text-slate-400'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'succeeded': return <CheckCircle className="w-4 h-4 text-green-400" />
            case 'failed': return <XCircle className="w-4 h-4 text-red-400" />
            case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
            case 'refunded': return <CreditCard className="w-4 h-4 text-blue-400" />
            default: return <Clock className="w-4 h-4 text-slate-400" />
        }
    }

    const exportPayments = () => {
        if (!filteredPayments) return

        const csvData = filteredPayments.map(payment => ({
            'Transaction ID': payment.transaction_id,
            'Booking Ref': payment.booking?.booking_reference || 'N/A',
            'Customer': payment.booking?.user?.full_name || payment.booking?.contact_email || 'N/A',
            'Amount': payment.amount,
            'Currency': payment.currency,
            'Gateway': payment.gateway,
            'Status': payment.status,
            'Date': new Date(payment.created_at).toLocaleString()
        }))

        const csvString = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
        ].join('\n')

        const blob = new Blob([csvString], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const totalRevenue = filteredPayments?.reduce((sum, payment) => {
        if (payment.status === 'succeeded') {
            return sum + (Number(payment.amount) || 0)
        }
        return sum
    }, 0) || 0

    const successRate = filteredPayments?.length ?
        Math.round((filteredPayments.filter(p => p.status === 'succeeded').length / filteredPayments.length) * 100) : 0

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h1 className="section-title">Payment Management</h1>
                    <p className="text-slate-400 mt-1">Monitor transactions, refunds, and payment gateway performance</p>
                </div>
                <button
                    onClick={exportPayments}
                    className="btn-secondary flex items-center gap-2"
                >
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-400">₹{totalRevenue.toLocaleString()}</p>
                        </div>
                        <IndianRupee className="w-8 h-8 text-green-400" />
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Success Rate</p>
                            <p className="text-2xl font-bold text-blue-400">{successRate}%</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Total Transactions</p>
                            <p className="text-2xl font-bold text-purple-400">{filteredPayments?.length || 0}</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field"
                    >
                        <option value="all">All Status</option>
                        <option value="succeeded">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>

                    <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        value={dateFilterDisplay}
                        onChange={(e) => {
                            let raw = e.target.value.replace(/[^\d\/]/g, '')
                            if (raw.length > 2 && raw[2] !== '/') raw = `${raw.slice(0, 2)}/${raw.slice(2)}`
                            if (raw.length > 5 && raw[5] !== '/') raw = `${raw.slice(0, 5)}/${raw.slice(5)}`
                            if (raw.length > 10) raw = raw.slice(0, 10)
                            setDateFilterDisplay(raw)

                            const parsed = parseDate(raw)
                            setDateFilter(parsed)
                        }}
                        className="input-field"
                    />

                    <button
                        onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                            setDateFilter('')
                            setDateFilterDisplay('')
                        }}
                        className="btn-secondary"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Payments Table */}
            <div className="card">
                {isLoading ? (
                    <div className="text-center py-8">Loading payments...</div>
                ) : filteredPayments?.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No payments found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left p-4">Transaction & Booking</th>
                                    <th className="text-left p-4">Customer</th>
                                    <th className="text-left p-4">Amount</th>
                                    <th className="text-left p-4">Gateway</th>
                                    <th className="text-left p-4">Status</th>
                                    <th className="text-left p-4">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments?.map((payment) => (
                                    <tr key={payment.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium font-mono text-sm">{payment.transaction_id}</div>
                                                <div className="text-xs text-slate-400 font-medium">Ref: {payment.booking?.booking_reference}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{payment.booking?.user?.full_name || 'Customer'}</div>
                                            <div className="text-xs text-slate-400">{payment.booking?.contact_email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium flex items-center">
                                                <IndianRupee className="w-3 h-3" />
                                                {Number(payment.amount).toLocaleString()}
                                                <span className="text-xs text-slate-400 ml-1 uppercase">{payment.currency}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-slate-700 rounded text-xs uppercase">
                                                {payment.gateway}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(payment.status)}
                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                {new Date(payment.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                <br />
                                                <span className="text-xs text-slate-400">
                                                    {new Date(payment.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}