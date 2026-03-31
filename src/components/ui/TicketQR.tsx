'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Paper, Typography, Stack, Button } from '@mui/material'
import { Download, FileText } from 'lucide-react'

interface TicketQRProps {
  bookingReference: string
  tripId: string
  seats: string[]
  size?: number
  showActions?: boolean
}

export function TicketQR({ 
  bookingReference, 
  tripId, 
  seats, 
  size = 150,
  showActions = true 
}: TicketQRProps) {
  const qrPayload = JSON.stringify({
    id: bookingReference,
    trip_id: tripId,
    seats,
  })

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2.5,
        borderRadius: 4,
        bgcolor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 200,
        mx: 'auto',
      }}
    >
      <QRCodeSVG 
        value={qrPayload} 
        size={size} 
        level="Q" 
        includeMargin={false} 
      />
      <Typography 
        variant="overline" 
        sx={{ mt: 1.5, fontWeight: 900, fontSize: '0.7rem' }}
      >
        SCAN AT BOARDING
      </Typography>
      
      {showActions && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button size="small" startIcon={<Download size={14} />}>
            PDF
          </Button>
          <Button size="small" startIcon={<FileText size={14} />}>
            Email
          </Button>
        </Stack>
      )}
    </Paper>
  )
}

