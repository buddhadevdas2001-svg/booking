'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Box,
    Container,
    Typography,
    Paper,
    Stack,
    Button,
    Grid,
    TextField,
    MenuItem,
    IconButton,
    InputAdornment,
    alpha,
    useTheme,
    CircularProgress,
    Divider,
    Breadcrumbs
} from '@mui/material'
import {
    ArrowLeft,
    Save,
    Calendar,
    Bus,
    MapPin,
    IndianRupee,
    Clock,
    ChevronRight,
    AlertCircle
} from 'lucide-react'
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
    const theme = useTheme()
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setForm((prev) => {
            const next = { ...prev, [name]: value }
            if (next.departure_time && next.arrival_time) {
                if (new Date(next.arrival_time) <= new Date(next.departure_time)) {
                    setTimeError('Arrival must be at least 1 hour after departure')
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
        const offset = arr.getTimezoneOffset() * 60000
        const formatted = new Date(arr.getTime() - offset).toISOString().slice(0, 16)
        
        setForm(prev => ({ ...prev, arrival_time: formatted }))
        setTimeError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (new Date(form.arrival_time) <= new Date(form.departure_time)) {
            setTimeError('Arrival must be after departure')
            toast.error('Invalid schedule')
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

            if (!res.ok) throw new Error('Failed to update trip')
            await queryClient.invalidateQueries({ queryKey: ['admin-trips'] })
            toast.success('Trip updated successfully')
            router.push('/admin/trips')
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update trip')
        } finally {
            setSaving(false)
        }
    }

    if (fetching) {
        return (
            <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">Loading trip details...</Typography>
            </Container>
        )
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={3} sx={{ mb: 6 }}>
                <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 1 }}>
                    <Link href="/admin/trips" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, '&:hover': { color: 'primary.main' } }}>Trips</Typography>
                    </Link>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Edit Schedule</Typography>
                </Breadcrumbs>

                <Stack direction="row" spacing={3} alignItems="center">
                    <IconButton 
                        component={Link} 
                        href="/admin/trips"
                        sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
                    >
                        <ArrowLeft size={20} />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
                            Edit Trip
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Update departure, arrival, and operational status.
                        </Typography>
                    </Box>
                </Stack>
            </Stack>

            <Paper 
                elevation={0} 
                component="form" 
                onSubmit={handleSubmit}
                sx={{ 
                    p: 5, 
                    borderRadius: 8, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : 'background.paper',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: 'success.main', opacity: 0.8 }} />

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Assigned Route"
                            name="route_id"
                            value={form.route_id}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><MapPin size={18} color={theme.palette.success.main} /></InputAdornment>,
                                sx: { borderRadius: 4, fontWeight: 700 }
                            }}
                        >
                            {routes?.map((route) => (
                                <MenuItem key={route.id} value={route.id} sx={{ fontWeight: 600 }}>
                                    {route.origin} → {route.destination}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            required
                            label="Assigned Bus"
                            name="bus_id"
                            value={form.bus_id}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Bus size={18} color={theme.palette.success.main} /></InputAdornment>,
                                sx: { borderRadius: 4, fontWeight: 700 }
                            }}
                        >
                            {buses?.map((bus) => (
                                <MenuItem key={bus.id} value={bus.id} sx={{ fontWeight: 600 }}>
                                    {bus.name} ({bus.bus_type})
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            required
                            type="datetime-local"
                            label="Departure Time"
                            name="departure_time"
                            value={form.departure_time}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Clock size={18} /></InputAdornment>,
                                sx: { borderRadius: 4, fontWeight: 800 }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ position: 'relative' }}>
                            <TextField
                                fullWidth
                                required
                                type="datetime-local"
                                label="Arrival Time"
                                name="arrival_time"
                                value={form.arrival_time}
                                onChange={handleChange}
                                error={!!timeError}
                                helperText={timeError}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Clock size={18} /></InputAdornment>,
                                    sx: { borderRadius: 4, fontWeight: 800 }
                                }}
                            />
                            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                                {[4, 8, 12].map(h => (
                                    <Button key={h} size="small" variant="outlined" onClick={() => setQuickArrivalTime(h)} sx={{ borderRadius: 2, fontSize: '0.65rem', fontWeight: 900, py: 0.2, minWidth: 45, borderColor: 'divider', color: 'text.secondary' }}>+{h}h</Button>
                                ))}
                            </Stack>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            required
                            type="number"
                            label="Base Ticket Price"
                            name="base_price"
                            value={form.base_price}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><IndianRupee size={18} /></InputAdornment>,
                                sx: { borderRadius: 4, fontWeight: 900 }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Trip Status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><AlertCircle size={18} /></InputAdornment>,
                                sx: { borderRadius: 4, fontWeight: 700 }
                            }}
                        >
                            <MenuItem value="scheduled">Scheduled</MenuItem>
                            <MenuItem value="boarding">Boarding</MenuItem>
                            <MenuItem value="delayed">Delayed</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                            <Button component={Link} href="/admin/trips" sx={{ borderRadius: 3, px: 4, fontWeight: 800, color: 'text.secondary' }}>Cancel</Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={saving || !!timeError}
                                color="success"
                                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save size={18} />}
                                sx={{ 
                                    borderRadius: 4, px: 6, py: 1.5, fontWeight: 900,
                                    boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.success.main, 0.3)}`
                                }}
                            >
                                {saving ? 'Saving...' : 'Update Trip'}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    )
}
