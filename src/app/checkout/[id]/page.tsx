'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
    ArrowLeft,
    Bus,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    CreditCard,
    Mail,
    Phone,
    Shield,
    Tag,
    Users,
    X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '@/components/common/Navbar'
import { createPendingBooking, getTripById, lockSeats } from '@/lib/api'
import { createCheckoutSession } from '@/lib/stripe'
import { useAuthStore, useBookingStore } from '@/store'

type AppliedCoupon = {
    id: string
    code: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    description?: string
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { user } = useAuthStore()
    const { selectedSeats, clearSeats, sessionId } = useBookingStore()
    const [loading, setLoading] = useState(false)
    const [passengerDetails, setPassengerDetails] = useState<Record<string, { name: string; age: string }>>({})
    const [contactInfo, setContactInfo] = useState({
        email: user?.email || '',
        phone: user?.phone || '',
    })

    // Coupon state
    const [couponCode, setCouponCode] = useState('')
    const [couponLoading, setCouponLoading] = useState(false)
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
    const [couponDiscount, setCouponDiscount] = useState(0)

    const { data: trip, isLoading } = useQuery({
        queryKey: ['checkout-trip', id],
        queryFn: () => getTripById(id),
        enabled: !!id,
    })

    useEffect(() => {
        setPassengerDetails((prev) => {
            const nextDetails: Record<string, { name: string; age: string }> = {}
            selectedSeats.forEach((seat) => {
                nextDetails[seat.id] = prev[seat.id] || { name: '', age: '' }
            })
            return nextDetails
        })
    }, [selectedSeats])

    useEffect(() => {
        if (!user && !isLoading) {
            router.push(`/auth/login?redirect=/checkout/${id}`)
        }
    }, [id, isLoading, router, user])

    useEffect(() => {
        if (selectedSeats.length === 0 && !isLoading) {
            toast.error('No seats selected')
            router.push(`/book/${id}`)
        }
    }, [selectedSeats, router, id, isLoading])

    const updatePassenger = (seatId: string, field: 'name' | 'age', value: string) => {
        setPassengerDetails((prev) => ({
            ...prev,
            [seatId]: { ...prev[seatId], [field]: value },
        }))
    }

    const subtotal = useMemo(() => selectedSeats.length * Number(trip?.base_price || 0), [selectedSeats.length, trip?.base_price])
    const gst = Math.round(subtotal * 0.05)
    const convenienceFee = selectedSeats.length > 0 ? 50 : 0
    const totalBeforeDiscount = subtotal + gst + convenienceFee
    const totalAmount = Math.max(0, totalBeforeDiscount - couponDiscount)

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code')
            return
        }
        setCouponLoading(true)
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode.trim(), cartTotal: subtotal }),
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || 'Invalid coupon')
            }
            setAppliedCoupon(data.coupon)
            setCouponDiscount(data.discountAmount)
            toast.success(`Coupon applied! You save ₹${data.discountAmount.toLocaleString()}`)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to apply coupon')
        } finally {
            setCouponLoading(false)
        }
    }

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null)
        setCouponDiscount(0)
        setCouponCode('')
        toast.success('Coupon removed')
    }

    const handlePayment = async () => {
        if (!user) {
            toast.error('Please login to continue')
            router.push(`/auth/login?redirect=/checkout/${id}`)
            return
        }

        for (const seat of selectedSeats) {
            const details = passengerDetails[seat.id]
            if (!details?.name.trim()) {
                toast.error(`Please enter passenger name for seat ${seat.label}`)
                return
            }
            if (!details?.age.trim()) {
                toast.error(`Please enter passenger age for seat ${seat.label}`)
                return
            }
        }

        if (!contactInfo.email.trim() || !contactInfo.phone.trim()) {
            toast.error('Please complete your contact information')
            return
        }

        if (!sessionId) {
            toast.error('Booking session expired. Please reselect your seats.')
            router.push(`/book/${id}`)
            return
        }

        setLoading(true)
        try {
            const locked = await lockSeats({
                tripId: id,
                seatLabels: selectedSeats.map((seat) => seat.label),
                sessionId,
                durationMinutes: 5,
            })

            if (locked.failed_seats.length > 0) {
                throw new Error(`Some seats are no longer available: ${locked.failed_seats.join(', ')}`)
            }

            const booking = await createPendingBooking({
                userId: user.id,
                tripId: id,
                totalAmount: subtotal,
                finalAmount: totalAmount,
                passengerDetails: selectedSeats.map((seat) => ({
                    seat_label: seat.label,
                    name: passengerDetails[seat.id].name,
                    age: Number(passengerDetails[seat.id].age),
                })),
                contactEmail: contactInfo.email,
                contactPhone: contactInfo.phone,
                bookingSeats: selectedSeats.map((seat) => ({
                    seat_label: seat.label,
                    passenger_name: passengerDetails[seat.id].name,
                    passenger_age: Number(passengerDetails[seat.id].age),
                    price: Number(trip?.base_price || 0),
                })),
                couponCode: appliedCoupon?.code,
            })

            await createCheckoutSession(booking.id)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create booking'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950">
                <Navbar />
                <div className="flex h-screen items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <main className="pt-24 pb-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Link href={`/book/${id}`} className="mb-6 inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-white">
                        <ArrowLeft size={18} />
                        <span>Back to seat selection</span>
                    </Link>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            {/* Passenger Details */}
                            <div className="card">
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                                    <Users size={20} className="text-blue-500" />
                                    Passenger Details
                                </h2>
                                <p className="mb-6 text-sm text-slate-400">Please enter details for each passenger as per government ID</p>

                                <div className="space-y-6">
                                    {selectedSeats.map((seat) => (
                                        <div key={seat.id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                                                    <span className="font-bold text-blue-400">{seat.label}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">Seat {seat.label}</p>
                                                    <p className="text-xs capitalize text-slate-400">
                                                        {seat.type} - {seat.deck} deck
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="label text-xs">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={passengerDetails[seat.id]?.name || ''}
                                                        onChange={(e) => updatePassenger(seat.id, 'name', e.target.value)}
                                                        placeholder="As per ID proof"
                                                        className="input py-2.5 text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label text-xs">Age</label>
                                                    <input
                                                        type="number"
                                                        value={passengerDetails[seat.id]?.age || ''}
                                                        onChange={(e) => updatePassenger(seat.id, 'age', e.target.value)}
                                                        placeholder="Age in years"
                                                        className="input py-2.5 text-sm"
                                                        min="1"
                                                        max="120"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="card">
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                                    <Phone size={20} className="text-blue-500" />
                                    Contact Information
                                </h2>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="label text-xs">Email Address</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="email"
                                                value={contactInfo.email}
                                                onChange={(e) => setContactInfo((prev) => ({ ...prev, email: e.target.value }))}
                                                className="input input-with-icon"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label text-xs">Phone Number</label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="tel"
                                                value={contactInfo.phone}
                                                onChange={(e) => setContactInfo((prev) => ({ ...prev, phone: e.target.value }))}
                                                className="input input-with-icon"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Coupon Code Section */}
                            <div className="card">
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                                    <Tag size={20} className="text-blue-500" />
                                    Apply Coupon
                                </h2>

                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 size={20} className="text-green-400" />
                                            <div>
                                                <p className="font-bold text-green-400 font-mono tracking-wider">{appliedCoupon.code}</p>
                                                <p className="text-xs text-slate-400">
                                                    {appliedCoupon.description || (
                                                        appliedCoupon.discount_type === 'percentage'
                                                            ? `${appliedCoupon.discount_value}% discount applied`
                                                            : `₹${appliedCoupon.discount_value} discount applied`
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-green-400 text-lg">-₹{couponDiscount.toLocaleString()}</span>
                                            <button
                                                onClick={handleRemoveCoupon}
                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                placeholder="Enter coupon code"
                                                className="input input-with-icon uppercase font-mono tracking-widest"
                                            />
                                        </div>
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading || !couponCode.trim()}
                                            className="btn-primary px-6 disabled:opacity-50"
                                        >
                                            {couponLoading ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                            ) : 'Apply'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div className="card">
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
                                    <CreditCard size={20} className="text-blue-500" />
                                    Payment Method
                                </h2>

                                <div className="space-y-3">
                                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 p-3 transition-colors hover:border-blue-500">
                                        <input type="radio" name="payment" defaultChecked className="h-4 w-4 text-blue-600" />
                                        <div className="flex flex-1 items-center justify-between">
                                            <span className="font-medium text-white">Stripe Checkout</span>
                                            <div className="flex gap-1">
                                                <span className="text-xs text-slate-500">Cards</span>
                                                <span className="text-xs text-slate-500">UPI</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Booking Summary Sidebar */}
                        <div className="space-y-6">
                            <div className="card sticky top-24">
                                <h3 className="mb-4 font-bold text-white">Booking Summary</h3>

                                <div className="space-y-3 border-b border-slate-800 pb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Bus size={14} />
                                        <span>{trip?.bus?.name}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">
                                            {trip?.route?.origin} &rarr; {trip?.route?.destination}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {trip?.departure_time
                                                ? `${new Date(trip.departure_time).toLocaleDateString('en-IN', {
                                                      weekday: 'short',
                                                      day: 'numeric',
                                                      month: 'short',
                                                  })}, ${new Date(trip.departure_time).toLocaleTimeString('en-IN', {
                                                      hour: '2-digit',
                                                      minute: '2-digit',
                                                  })}`
                                                : ''}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>Live inventory</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            <span>5 min seat hold</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-b border-slate-800 py-4">
                                    <p className="mb-2 text-sm text-slate-400">Selected Seats</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSeats.map((seat) => (
                                            <span key={seat.id} className="rounded-lg bg-blue-600/20 px-3 py-1.5 font-medium text-blue-400">
                                                {seat.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 py-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Ticket Price ({selectedSeats.length} seats)</span>
                                        <span className="text-white">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">GST (5%)</span>
                                        <span className="text-white">₹{gst.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Convenience Fee</span>
                                        <span className="text-white">₹{convenienceFee.toLocaleString()}</span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="flex items-center gap-1 text-green-400">
                                                <Tag size={12} />
                                                Coupon ({appliedCoupon?.code})
                                            </span>
                                            <span className="font-bold text-green-400">-₹{couponDiscount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                                    <span className="font-bold text-white">Total Amount</span>
                                    <div className="text-right">
                                        {couponDiscount > 0 && (
                                            <p className="text-xs text-slate-500 line-through">₹{totalBeforeDiscount.toLocaleString()}</p>
                                        )}
                                        <span className="text-2xl font-bold text-white">₹{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                {couponDiscount > 0 && (
                                    <div className="mt-2 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-center">
                                        <p className="text-xs font-bold text-green-400">🎉 You save ₹{couponDiscount.toLocaleString()} with this coupon!</p>
                                    </div>
                                )}

                                <button onClick={handlePayment} disabled={loading} className="btn-primary mt-6 flex w-full items-center justify-center gap-2">
                                    {loading ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Shield size={18} />
                                            <span>Pay Securely</span>
                                            <ChevronRight size={18} />
                                        </>
                                    )}
                                </button>

                                <p className="mt-4 text-center text-xs text-slate-500">
                                    By proceeding, you agree to our Terms of Service and Cancellation Policy
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
