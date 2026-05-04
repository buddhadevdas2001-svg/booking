'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
    Box,
    Typography,
    Paper,
    Stack,
    Button,
    Grid,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    alpha,
    useTheme,
    Skeleton,
    Avatar,
    Tooltip,
    Divider,
} from '@mui/material'
import {
    Bus,
    Plus,
    Search,
    Shield,
    Edit2,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Wifi,
    Tv,
    Wind,
    Usb
} from 'lucide-react'
import type { Bus as BusType } from '@/types/supabase'

export default function AdminBusesPage() {
    const theme = useTheme()
    const [search, setSearch] = useState('')

    const { data: buses = [], isLoading, refetch, isFetching } = useQuery({
        queryKey: ['admin-buses'],
        queryFn: async () => {
            const res = await fetch('/api/admin/buses')
            if (!res.ok) throw new Error('Failed to load buses')
            return res.json() as Promise<BusType[]>
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

    const getAmenityIcon = (amenity: string) => {
        const a = amenity.toLowerCase()
        if (a.includes('wifi')) return <Wifi size={14} />
        if (a.includes('tv') || a.includes('entertainment')) return <Tv size={14} />
        if (a.includes('ac') || a.includes('air')) return <Wind size={14} />
        if (a.includes('usb') || a.includes('charge')) return <Usb size={14} />
        return null
    }

    return (
        <Stack spacing={4}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
                <Box>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1, color: 'primary.main' }}>
                        <Bus size={22} />
                        <Typography variant="overline" sx={{ fontWeight: 900, letterSpacing: '0.2em' }}>Fleet Management</Typography>
                    </Stack>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                        Bus Inventory
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage vehicles, seat configurations, and luxury amenities.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        onClick={() => refetch()}
                        variant="outlined"
                        startIcon={<RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />}
                        sx={{ borderRadius: 3, fontWeight: 800, borderColor: 'divider' }}
                    >
                        Refresh
                    </Button>
                    <Button
                        component={Link}
                        href="/admin/buses/new"
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        sx={{ borderRadius: 3, px: 3, fontWeight: 900, boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}` }}
                    >
                        Add Bus
                    </Button>
                </Stack>
            </Box>

            {/* Search Bar */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.4) : 'background.paper' }}>
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Search by name, registration, or type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: <InputAdornment position="start"><Search size={20} className="text-primary" /></InputAdornment>,
                        sx: { px: 2, py: 1, fontWeight: 600, fontSize: '1.1rem' }
                    }}
                />
            </Paper>

            {/* Grid */}
            <Grid container spacing={3}>
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
                            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 6 }} />
                        </Grid>
                    ))
                ) : filtered.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 10, textAlign: 'center', borderRadius: 8, border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>No buses found</Typography>
                            <Typography variant="body2" color="text.secondary">Try adjusting your search or add a new vehicle.</Typography>
                        </Paper>
                    </Grid>
                ) : (
                    filtered.map((bus) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={bus.id}>
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 6, 
                                    border: '1px solid', 
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        borderColor: 'primary.main',
                                        boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.1)}`
                                    }
                                }}
                            >
                                <Stack spacing={3}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                                Registration
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>{bus.registration_number}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{bus.name}</Typography>
                                        </Box>
                                        <Chip 
                                            label={bus.bus_type} 
                                            size="small" 
                                            sx={{ fontWeight: 900, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: 1.5 }}
                                        />
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Seats</Typography>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{bus.total_seats ?? '—'} Total</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Status</Typography>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                {bus.is_active !== false ? <CheckCircle2 size={12} className="text-success" /> : <XCircle size={12} className="text-error" />}
                                                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: bus.is_active !== false ? 'success.main' : 'error.main' }}>
                                                    {bus.is_active !== false ? 'Active' : 'Inactive'}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                    </Grid>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Amenities</Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                            {(bus.amenities || []).slice(0, 4).map((amenity, idx) => (
                                                <Tooltip key={idx} title={amenity}>
                                                    <Chip 
                                                        icon={getAmenityIcon(amenity) || undefined}
                                                        label={amenity} 
                                                        size="small" 
                                                        variant="outlined"
                                                        sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem', py: 1 }}
                                                    />
                                                </Tooltip>
                                            ))}
                                            {(bus.amenities?.length || 0) > 4 && (
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', my: 'auto', pl: 0.5 }}>
                                                    +{(bus.amenities?.length || 0) - 4}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Box>

                                    <Divider />

                                    <Button
                                        component={Link}
                                        href={`/admin/buses/${bus.id}/edit`}
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<Edit2 size={16} />}
                                        sx={{ borderRadius: 3, fontWeight: 800, borderColor: 'divider', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                                    >
                                        Edit Details
                                    </Button>
                                </Stack>
                            </Paper>
                        </Grid>
                    ))
                )}
            </Grid>
        </Stack>
    )
}
