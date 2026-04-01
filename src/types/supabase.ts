export type UserRole = 'admin' | 'agent' | 'customer' | 'driver' | 'conductor'

export type SeatType = 'seater' | 'sleeper' | 'driver' | 'empty'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'failed'

export type TripStatus = 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled' | 'delayed'

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded'

export type PassengerDetail = {
  name?: string
  age?: number
  gender?: string
  seat_label?: string
  [key: string]: unknown
}

export type AvailableSeatRow = {
  seat_label: string
  is_available: boolean
  is_locked: boolean
}

export type SearchTrip = {
  id: string
  departure_time: string
  arrival_time: string
  status: TripStatus
  available_seats: number
  total_seats: number
  base_price: number
  route: {
    origin: string
    destination: string
    estimated_duration_minutes: number
  }
  bus: {
    id: string
    name: string
    bus_type: string
    amenities: string[]
  }
  seat_layout?: {
    layout_data: SeatLayoutData
  }
}

export type Seat = {
  id: string
  label: string
  type: SeatType
  deck: 'lower' | 'upper'
  col: number
  row: number
  price_multiplier?: number
}

export type SeatLayoutData = {
  rows: number
  cols: number
  seats: Seat[]
  hasUpperDeck?: boolean
}

export type SeatLayout = {
  id: string
  name: string
  bus_id?: string
  layout_data: SeatLayoutData
  is_template: boolean
  is_active: boolean
  created_at: string
}

export type Booking = {
  id: string
  booking_reference: string
  user_id: string
  trip_id: string
  total_amount: number
  discount_amount?: number
  final_amount: number
  passenger_details: PassengerDetail[] | null
  contact_email: string
  contact_phone: string
  status: BookingStatus
  payment_status: PaymentStatus
  created_at: string
}

export type BookingSeat = {
  id: string
  booking_id: string
  seat_label: string
  passenger_name: string
  passenger_age: number
  price: number
  status: string
}

export type Payment = {
  id: string
  booking_id: string
  transaction_id: string
  gateway: string
  amount: number
  currency: string
  status: string
  created_at: string
  gateway_response?: Record<string, unknown> | null
}

export type Bus = {
  id: string
  name: string
  registration_number: string
  bus_type: string
  total_seats: number
  amenities: string[]
  is_active: boolean
}

export type Route = {
  id: string
  origin: string
  destination: string
  distance_km: number
  estimated_duration_minutes: number
  is_active: boolean
  min_price?: number
}

export type Trip = {
  id: string
  bus_id: string
  route_id: string
  departure_time: string
  arrival_time: string
  status: TripStatus
  base_price: number
  available_seats: number
  total_seats?: number
}

export type Coupon = {
  id: string
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  valid_until: string
  is_active: boolean
}

export type Profile = {
  id: string
  full_name: string
  email?: string
  role?: UserRole
  phone?: string
  avatar_url?: string
  created_at?: string
}

export type Staff = {
  id: string
  staff_type: UserRole
  employee_id: string
  license_number: string
  experience_years: number
  joining_date: string
  salary: number
  is_active: boolean
  user_id: string
}

export type AnalyticsRevenuePoint = {
  day: string
  revenue: number
  name?: string
}

export type AnalyticsRoutePoint = {
  name: string
  bookings: number
  revenue?: number
}

export type AnalyticsBusTypePoint = {
  name: string
  value: number
  color?: string
}

export type AdminAnalytics = {
  revenueSeries: AnalyticsRevenuePoint[]
  popularRoutes: AnalyticsRoutePoint[]
  busTypes: AnalyticsBusTypePoint[]
  avgOccupancy: number
}

export type AdminRecentBooking = Booking & {
  trip?: {
    route?: {
      origin?: string
      destination?: string
    }
    bus?: {
      name?: string
    }
  }
}

export type AdminUpcomingTrip = Trip & {
  route?: {
    origin?: string
    destination?: string
  }
  bus?: {
    name?: string
    total_seats?: number
    bus_type?: string
  }
}

export type AdminSummary = {
  stats: {
    totalBookings: number
    totalRevenue: number
    totalUsers: number
    activeBuses: number
    confirmationRate: number
  }
  recentBookings: AdminRecentBooking[]
  upcomingTrips: AdminUpcomingTrip[]
}

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
      }
      bookings: {
        Row: Booking
        Insert: Partial<Booking>
      }
      staff: {
        Row: Staff
        Insert: Partial<Staff>
      }
      payments: {
        Row: Payment
        Insert: Partial<Payment>
      }
      trip_staff: {
        Row: {
          id: string
          trip_id: string
          staff_id: string
          role: string
          attendance_status?: string
          created_at?: string
        }
        Insert: {
          trip_id: string
          staff_id: string
          role: string
          attendance_status?: string
        }
      }
      // Add other tables as needed for createAdminClient
    }
  }
}
