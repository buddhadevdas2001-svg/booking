'use client'

import { use, useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
    Box,
    Container,
    Typography,
    Paper,
    Stack,
    Button,
    Grid,
    TextField,
    Divider,
    IconButton,
    Chip,
    alpha,
    useTheme,
    Skeleton,
    Avatar,
    InputAdornment,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Fade,
} from '@mui/material'
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
    Info,
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

// SeatHoldTimer Component
function SeatHoldTimer({ expiresAt, onExpire }: { expiresAt: string | null, onExpire: () => void }) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const theme = useTheme()

    useEffect(() => {
        if (!expiresAt) return

        const update = () => {
            const diff = new Date(expiresAt).getTime() - Date.now()
            if (diff <= 0) {
                setTimeLeft(0)
                onExpire()
                return
            }
            setTimeLeft(Math.floor(diff / 1000))
        }

        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [expiresAt, onExpire])

    if (timeLeft === null) return null

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const isCritical = timeLeft < 60

    return (
        <Chip
            icon={<Clock size={16} color={isCritical ? theme.palette.error.main : theme.palette.warning.main} />}
            label={`${minutes}:${seconds.toString().padStart(2, '0')} left`}
            sx={{
                fontWeight: 900,
                bgcolor: isCritical ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                color: isCritical ? 'error.main' : 'warning.main',
                border: '1px solid',
                borderColor: isCritical ? 'error.main' : 'warning.main',
                animation: isCritical ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.6 },
                    '100%': { opacity: 1 },
                },
            }}
        />
    )
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const theme = useTheme()
    const { user } = useAuthStore()
    const { selectedSeats, clearSeats, sessionId, expiresAt } = useBookingStore()
    const [loading, setLoading] = useState(false)
    const [passengerDetails, setPassengerDetails] = useState<Record<string, { name: string; age: string }>>({})
    const [contactInfo, setContactInfo] = useState({
        email: user?.email || '',
        phone: user?.phone || '',
    })

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

    const handleExpire = useCallback(() => {
        toast.error('Seat hold session expired. Please reselect your seats.')
        clearSeats()
        router.push(`/book/${id}`)
    }, [clearSeats, id, router])

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
            if (!res.ok) throw new Error(data.message || 'Invalid coupon')
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
            router.push(`/auth/login?redirect=/checkout/${id}`)
            return
        }

        for (const seat of selectedSeats) {
            const details = passengerDetails[seat.id]
            if (!details?.name.trim() || !details?.age.trim()) {
                toast.error(`Please complete passenger details for seat ${seat.label}`)
                return
            }
        }

        if (!contactInfo.email.trim() || !contactInfo.phone.trim()) {
            toast.error('Please complete your contact information')
            return
        }

        setLoading(true)
        try {
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
            toast.error(err instanceof Error ? err.message : 'Failed to create booking')
        } finally {
            setLoading(false)
        }
    }

    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                <Navbar />
                <Container sx={{ pt: 20, textAlign: 'center' }}>
                    <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
                </Container>
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />

            <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 16 }, pb: 10 }}>
                <Link href={`/book/${id}`} style={{ textDecoration: 'none' }}>
                    <Button
                        startIcon={<ArrowLeft size={18} />}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' }, mb: 4, fontWeight: 700 }}
                    >
                        Back to seat selection
                    </Button>
                </Link>

                <Grid container spacing={4}>
                    {/* Left Column: Passenger Details */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Stack spacing={4}>
                            {/* Seat Hold Warning */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.primary.main, 0.1),
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                                        <Clock size={20} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Seat Hold Active</Typography>
                                        <Typography variant="caption" color="text.secondary">Your selection is reserved for 5 minutes.</Typography>
                                    </Box>
                                </Stack>
                                <SeatHoldTimer expiresAt={expiresAt} onExpire={handleExpire} />
                            </Paper>

                            {/* Passenger Forms */}
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Users size={24} className="text-primary" />
                                    Passenger Details
                                </Typography>
                                <Stack spacing={3}>
                                    {selectedSeats.map((seat) => (
                                        <Paper
                                            key={seat.id}
                                            variant="outlined"
                                            sx={{ p: 3, borderRadius: 4, bgcolor: alpha(theme.palette.background.paper, 0.5) }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 900, fontSize: '0.9rem' }}>
                                                    {seat.label}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Seat {seat.label}</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                                        {seat.type} · {seat.deck} Deck
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                            <Grid container spacing={3}>
                                                <Grid size={{ xs: 12, sm: 8 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Full Name"
                                                        variant="outlined"
                                                        placeholder="As per Government ID"
                                                        value={passengerDetails[seat.id]?.name || ''}
                                                        onChange={(e) => updatePassenger(seat.id, 'name', e.target.value)}
                                                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 4 }}>
                                                    <TextField
                                                        fullWidth
                                                        label="Age"
                                                        type="number"
                                                        variant="outlined"
                                                        value={passengerDetails[seat.id]?.age || ''}
                                                        onChange={(e) => updatePassenger(seat.id, 'age', e.target.value)}
                                                        InputProps={{ sx: { borderRadius: 3, fontWeight: 600 } }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Paper>

                            {/* Contact Info */}
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Phone size={24} className="text-primary" />
                                    Contact Details
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            placeholder="your@email.com"
                                            value={contactInfo.email}
                                            onChange={(e) => setContactInfo(p => ({ ...p, email: e.target.value }))}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment>,
                                                sx: { borderRadius: 3, fontWeight: 600 }
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            placeholder="9876543210"
                                            value={contactInfo.phone}
                                            onChange={(e) => setContactInfo(p => ({ ...p, phone: e.target.value }))}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><Phone size={18} /></InputAdornment>,
                                                sx: { borderRadius: 3, fontWeight: 600 }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Coupon Section */}
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Tag size={20} className="text-primary" />
                                    Offers & Coupons
                                </Typography>
                                {appliedCoupon ? (
                                    <Fade in>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.05), borderColor: 'success.main', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <CheckCircle2 color={theme.palette.success.main} size={24} />
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'success.main' }}>{appliedCoupon.code} APPLIED</Typography>
                                                    <Typography variant="caption" color="text.secondary">{appliedCoupon.description || 'Savings applied successfully!'}</Typography>
                                                </Box>
                                            </Stack>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'success.main' }}>-₹{couponDiscount}</Typography>
                                                <IconButton size="small" onClick={handleRemoveCoupon}><X size={16} /></IconButton>
                                            </Stack>
                                        </Paper>
                                    </Fade>
                                ) : (
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            fullWidth
                                            placeholder="PROMOCODE"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><Tag size={18} /></InputAdornment>,
                                                sx: { borderRadius: 3, fontWeight: 800, letterSpacing: '0.1em' }
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            disabled={couponLoading || !couponCode.trim()}
                                            onClick={handleApplyCoupon}
                                            sx={{ borderRadius: 3, px: 4, fontWeight: 900 }}
                                        >
                                            {couponLoading ? '...' : 'APPLY'}
                                        </Button>
                                    </Stack>
                                )}
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Right Column: Summary */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 8, border: '1px solid', borderColor: 'divider', position: 'sticky', top: 100, bgcolor: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(20px)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>Booking Summary</Typography>
                            
                            <Stack spacing={3} sx={{ mb: 4 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bus Info</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 900, mt: 0.5 }}>{trip?.bus?.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{trip?.bus?.bus_type}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Route & Time</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 900, mt: 0.5 }}>
                                        {trip?.route?.origin} → {trip?.route?.destination}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                        <Calendar size={14} className="text-primary" />
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {trip?.departure_time ? new Date(trip.departure_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                        </Typography>
                                        <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
                                        <Clock size={14} className="text-primary" />
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {trip?.departure_time ? new Date(trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Seats Selected</Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                                        {selectedSeats.map(s => (
                                            <Chip key={s.id} label={s.label} size="small" variant="outlined" sx={{ fontWeight: 900, borderRadius: 1.5, borderColor: 'primary.main', color: 'primary.main' }} />
                                        ))}
                                    </Stack>
                                </Box>
                            </Stack>

                            <Divider sx={{ mb: 4 }} />

                            <Stack spacing={2} sx={{ mb: 4 }}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Ticket Price</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{subtotal.toLocaleString()}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">GST (5%)</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{gst.toLocaleString()}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">Convenience Fee</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{convenienceFee.toLocaleString()}</Typography>
                                </Stack>
                                {couponDiscount > 0 && (
                                    <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Coupon Discount</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 900 }}>-₹{couponDiscount.toLocaleString()}</Typography>
                                    </Stack>
                                )}
                                <Divider />
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                                    <Typography variant="h6" sx={{ fontWeight: 900 }}>Total Amount</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>₹{totalAmount.toLocaleString()}</Typography>
                                </Stack>
                            </Stack>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handlePayment}
                                disabled={loading}
                                startIcon={<Shield size={20} />}
                                endIcon={<ChevronRight size={20} />}
                                sx={{
                                    py: 2,
                                    borderRadius: 4,
                                    fontWeight: 900,
                                    fontSize: '1.1rem',
                                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                                }}
                            >
                                {loading ? 'Processing...' : 'Pay Securely'}
                            </Button>

                            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mt: 3, opacity: 0.6 }}>
                                <CreditCard size={14} />
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>Secure 256-bit SSL Encrypted Payment</Typography>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}
