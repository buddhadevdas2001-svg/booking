// Shared E-Ticket PDF generator using jsPDF
// Matches the dark-themed Voyatra ticket design.

export interface PDFBookingData {
  id: string
  booking_reference: string
  status: string
  final_amount: number
  total_amount?: number
  discount_amount?: number
  created_at: string
  contact_phone?: string
  contact_email?: string
  booking_seats?: { seat_label: string; passenger_name?: string; passenger_age?: number; price?: number }[]
}

export interface PDFRouteData {
  origin?: string
  destination?: string
}

export interface PDFBusData {
  name?: string
  bus_type?: string
}

export interface PDFTripData {
  departure_time?: string
  arrival_time?: string
}

export async function generateETicketPDF(
  booking: PDFBookingData,
  route: PDFRouteData,
  bus: PDFBusData,
  trip: PDFTripData,
  qrPayload: string
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18
  const contentW = pageW - margin * 2

  // ── Background ──
  doc.setFillColor(15, 23, 42) // slate-950
  doc.rect(0, 0, pageW, 297, 'F')

  // ── Header band ──
  doc.setFillColor(37, 99, 235) // blue-600
  doc.rect(0, 0, pageW, 38, 'F')

  // Company name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  doc.text('Voyatra', margin, 16)

  // Tagline
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(147, 197, 253) // blue-300
  doc.text('Your Journey, Our Commitment', margin, 23)

  // E-TICKET label on right
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('E-TICKET', pageW - margin, 14, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(147, 197, 253)
  doc.text('ELECTRONIC BOARDING PASS', pageW - margin, 21, { align: 'right' })

  // ── Reference and status row ──
  let y = 50
  doc.setFillColor(30, 41, 59) // slate-800
  doc.roundedRect(margin, y - 6, contentW, 18, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text(`REF: ${booking.booking_reference || booking.id.slice(0, 8).toUpperCase()}`, margin + 4, y + 4)

  const statusColor = booking.status === 'confirmed' ? [34, 197, 94] : [239, 68, 68]
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
  const statusLabel = booking.status.toUpperCase()
  doc.roundedRect(pageW - margin - 30, y - 3, 30, 10, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(statusLabel, pageW - margin - 15, y + 4, { align: 'center' })

  // ── Route section ──
  y += 26
  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184) // slate-400
  doc.text('ROUTE', margin, y)

  y += 6
  const origin = route?.origin || 'N/A'
  const destination = route?.destination || 'N/A'

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text(origin, margin, y + 4)

  // Arrow
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setTextColor(96, 165, 250) // blue-400
  doc.text('\u2192', pageW / 2, y + 4, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text(destination, pageW - margin, y + 4, { align: 'right' })

  // ── Dashed separator ──
  y += 18
  doc.setDrawColor(51, 65, 85)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(margin, y, pageW - margin, y)
  doc.setLineDashPattern([], 0)

  // ── Trip details grid ──
  y += 10
  const col1 = margin
  const col2 = margin + contentW / 3
  const col3 = margin + (contentW * 2) / 3

  const depDate = trip?.departure_time
    ? new Date(trip.departure_time).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : 'TBD'
  const depTime = trip?.departure_time
    ? new Date(trip.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : 'TBD'
  const arrTime = trip?.arrival_time
    ? new Date(trip.arrival_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : 'TBD'

  const details = [
    { col: col1, label: 'DATE', value: depDate },
    { col: col2, label: 'DEPARTURE', value: depTime },
    { col: col3, label: 'ARRIVAL', value: arrTime },
  ]

  details.forEach(({ col, label, value }) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(label, col, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text(value, col, y + 7)
  })

  y += 20
  // Bus info row
  const busDetails = [
    { col: col1, label: 'BUS', value: bus?.name || 'N/A' },
    { col: col2, label: 'BUS TYPE', value: bus?.bus_type || 'N/A' },
    { col: col3, label: 'BOOKED ON', value: new Date(booking.created_at).toLocaleDateString('en-IN') },
  ]

  busDetails.forEach(({ col, label, value }) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(label, col, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text(value, col, y + 7)
  })

  // ── Dashed separator ──
  y += 20
  doc.setDrawColor(51, 65, 85)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(margin, y, pageW - margin, y)
  doc.setLineDashPattern([], 0)

  // ── Passengers table ──
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(96, 165, 250)
  doc.text('PASSENGER DETAILS', margin, y)

  y += 6
  // Table header
  doc.setFillColor(30, 41, 59)
  doc.rect(margin, y, contentW, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('#', margin + 3, y + 5)
  doc.text('SEAT', margin + 12, y + 5)
  doc.text('PASSENGER NAME', margin + 35, y + 5)
  doc.text('AGE', margin + contentW - 20, y + 5)

  y += 8
  const seats = booking.booking_seats || []
  seats.forEach((seat, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(22, 33, 51)
      doc.rect(margin, y, contentW, 8, 'F')
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(String(idx + 1), margin + 3, y + 5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(96, 165, 250)
    doc.text(seat.seat_label, margin + 12, y + 5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(255, 255, 255)
    doc.text(seat.passenger_name || '—', margin + 35, y + 5)
    doc.text(seat.passenger_age ? String(seat.passenger_age) : '—', margin + contentW - 20, y + 5)
    y += 8
  })

  // ── Dashed separator ──
  y += 4
  doc.setDrawColor(51, 65, 85)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(margin, y, pageW - margin, y)
  doc.setLineDashPattern([], 0)

  // ── Pricing ──
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(96, 165, 250)
  doc.text('FARE DETAILS', margin, y)

  y += 6
  const subtotal = booking.total_amount || 0
  const discount = booking.discount_amount || 0
  const finalAmt = booking.final_amount || 0

  const pricingRows: Array<{ label: string; value: string; highlight?: boolean }> = [
    { label: 'Ticket Price:', value: `Rs. ${subtotal.toLocaleString()}` },
  ]
  if (discount > 0) {
    pricingRows.push({ label: 'Coupon Discount:', value: `-Rs. ${discount.toLocaleString()}`, highlight: true })
  }
  pricingRows.push({ label: 'Total Paid:', value: `Rs. ${finalAmt.toLocaleString()}`, highlight: true })

  pricingRows.forEach(({ label, value, highlight }) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(highlight ? 11 : 9)
    doc.setTextColor(highlight ? 255 : 148, highlight ? 255 : 163, highlight ? 255 : 184)
    doc.text(label, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(highlight ? 96 : 255, highlight ? 165 : 255, highlight ? 250 : 255)
    if (highlight && label.includes('Total')) doc.setFontSize(13)
    doc.text(value, pageW - margin, y, { align: 'right' })
    y += highlight && label.includes('Total') ? 9 : 7
  })

  // ── QR code ──
  const qrSize = 45
  const qrX = pageW - margin - qrSize
  const qrY = 200

  // White background for QR
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 10, 2, 2, 'F')

  try {
    const qrCanvas = document.createElement('canvas')
    qrCanvas.width = 200
    qrCanvas.height = 200
    const QRCode = (await import('qrcode')).default
    await QRCode.toCanvas(qrCanvas, qrPayload, {
      width: 200,
      color: { dark: '#000000', light: '#ffffff' },
    })
    const qrDataUrl = qrCanvas.toDataURL('image/png')
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
  } catch {
    doc.setFontSize(7)
    doc.setTextColor(0, 0, 0)
    doc.text('QR CODE', qrX + qrSize / 2, qrY + qrSize / 2, { align: 'center' })
  }

  // QR label
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text('SCAN AT BOARDING', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center' })

  // ── Footer ──
  const footerY = 282
  doc.setFillColor(30, 41, 59)
  doc.rect(0, footerY - 4, pageW, 20, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text(
    'This is an auto-generated e-ticket. Please carry a valid photo ID. Voyatra Bus Agency.',
    pageW / 2,
    footerY + 4,
    { align: 'center' }
  )

  doc.save(`Voyatra-Ticket-${booking.booking_reference || booking.id.slice(0, 8)}.pdf`)
}
