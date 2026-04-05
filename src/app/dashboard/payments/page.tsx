'use client'

import { useQuery } from '@tanstack/react-query'
import { 
    CreditCard, 
    ArrowRight, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    ExternalLink,
    Search,
    Filter
} from 'lucide-react'
import {
    Box,
    Typography,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    alpha,
    useTheme,
    Skeleton,
    IconButton,
    InputBase,
    Button,
    Container
} from '@mui/material'

type PaymentRecord = {
    id: string
    booking_reference: string
    transaction_id: string
    amount: number
    currency: string
    status: string
    method: string
    date: string
    route: string
}

export default function PaymentHistoryPage() {
    const theme = useTheme()

    const { data: payments = [], isLoading } = useQuery<PaymentRecord[]>({
        queryKey: ['my-payments'],
        queryFn: async () => {
            const res = await fetch('/api/dashboard/payments')
            if (!res.ok) throw new Error('Failed to fetch payments')
            return res.json()
        }
    })

    const getStatusChip = (status: string) => {
        const s = status?.toLowerCase()
        if (s === 'succeeded' || s === 'paid' || s === 'confirmed') {
            return (
                <Chip 
                    icon={<CheckCircle2 size={14} />} 
                    label="Succeeded" 
                    size="small"
                    sx={{ 
                        bgcolor: alpha(theme.palette.success.main, 0.1), 
                        color: 'success.main',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.success.main, 0.2)
                    }} 
                />
            )
        }
        if (s === 'pending') {
            return (
                <Chip 
                    icon={<Clock size={14} />} 
                    label="Pending" 
                    size="small"
                    sx={{ 
                        bgcolor: alpha(theme.palette.warning.main, 0.1), 
                        color: 'warning.main',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.warning.main, 0.2)
                    }} 
                />
            )
        }
        return (
            <Chip 
                icon={<AlertCircle size={14} />} 
                label={status || 'Failed'} 
                size="small"
                sx={{ 
                    bgcolor: alpha(theme.palette.error.main, 0.1), 
                    color: 'error.main',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.error.main, 0.2)
                }} 
            />
        )
    }

    return (
        <Stack spacing={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                        Payment History
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        View and manage your recent transactions and receipts
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<Filter size={18} />}
                    sx={{ borderRadius: 3, fontWeight: 700 }}
                >
                    Filter
                </Button>
            </Box>

            {/* Search Bar */}
            <Paper
                elevation={0}
                sx={{
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                }}
            >
                <IconButton sx={{ p: '10px' }} aria-label="search">
                    <Search size={20} />
                </IconButton>
                <InputBase
                    sx={{ ml: 1, flex: 1, fontWeight: 500 }}
                    placeholder="Search by Transaction ID or Reference"
                    inputProps={{ 'aria-label': 'search payments' }}
                />
            </Paper>

            {isLoading ? (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(theme.palette.divider, 0.02) }}>
                                <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Transaction Details</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton width={80} /></TableCell>
                                    <TableCell><Skeleton width={200} /></TableCell>
                                    <TableCell><Skeleton width={60} /></TableCell>
                                    <TableCell><Skeleton width={100} /></TableCell>
                                    <TableCell align="right"><Skeleton width={40} sx={{ ml: 'auto' }} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : payments.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 10,
                        textAlign: 'center',
                        borderRadius: 6,
                        border: '2px dashed',
                        borderColor: 'divider',
                        bgcolor: alpha(theme.palette.divider, 0.01),
                    }}
                >
                    <Box sx={{ 
                        display: 'inline-flex', 
                        p: 3, 
                        borderRadius: '50%', 
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        color: 'primary.main',
                        mb: 3 
                    }}>
                        <CreditCard size={48} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                        No transactions yet
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                        When you book a bus ticket, your payment history and receipts will appear here.
                    </Typography>
                    <Button 
                        variant="contained" 
                        size="large" 
                        href="/search"
                        sx={{ borderRadius: 4, px: 6, fontWeight: 800 }}
                    >
                        Book Your First Trip
                    </Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 6, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(theme.palette.divider, 0.02) }}>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Date \u0026 Time</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Transaction Details</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>Receipt</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow 
                                    key={payment.id}
                                    sx={{ 
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.01) },
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(payment.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box sx={{ 
                                                p: 1, 
                                                borderRadius: 2, 
                                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                                color: 'secondary.main'
                                            }}>
                                                <CreditCard size={20} />
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                    {payment.route}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'monospace' }}>
                                                    ID: {payment.transaction_id}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body1" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                            ₹{payment.amount.toLocaleString()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            via {payment.method}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusChip(payment.status)}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton 
                                            size="small" 
                                            sx={{ 
                                                color: 'primary.main',
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                            }}
                                        >
                                            <ExternalLink size={18} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Stack>
    )
}
