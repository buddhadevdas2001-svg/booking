export type AvailableSeatRow = {
  seat_label: string
  is_available: boolean
  is_locked: boolean
}

export type SearchTrip = {
  id: string
  departure_time: string
  arrival_time: string
  status: string
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

export type AdminSummary = {
  stats: {
    totalBookings: number
    totalRevenue: number
    totalUsers: number
    activeBuses: number
    confirmationRate: number
  }
  recentBookings: (Booking & { trip: SearchTrip })[]
  upcomingTrips: SearchTrip[]
}

export type SeatType = 'seater' | 'sleeper' | 'driver' | 'empty'

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
  final_amount: number
  passenger_details: any
  contact_email: string
  contact_phone: string
  status: string
  payment_status: string
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
}

export type Trip = {
  id: string
  bus_id: string
  route_id: string
  departure_time: string
  arrival_time: string
  status: string
  base_price: number
  available_seats: number
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
  role?: 'customer' | 'admin' | 'agent' | 'staff'
  phone?: string
  avatar_url?: string
}

export type Staff = {
  id: string
  staff_type: string
  employee_id: string
  license_number: string
  experience_years: number
  joining_date: string
  salary: number
  is_active: boolean
  user_id: string
}

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: Booking
        Insert: Partial<Booking>
      }
      staff: {
        Row: Staff
        Insert: Partial<Staff>
      }
      // Add other tables as needed for createAdminClient
    }
  }
}
