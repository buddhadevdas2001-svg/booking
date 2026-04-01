-- =====================================================
-- BUS AGENCY MANAGEMENT SYSTEM - COMPLETE SCHEMA
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";


-- =====================================================
-- 1. ENUMS
-- =====================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'agent', 'customer', 'driver', 'conductor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE seat_type AS ENUM ('seater', 'sleeper', 'driver', 'empty');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled', 'delayed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('email', 'sms', 'push');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- 2. PROFILES (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    preferred_language TEXT DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{
        "booking_confirmation": {"email": true, "sms": true},
        "trip_reminder": {"email": true, "sms": true},
        "cancellation": {"email": true, "sms": true},
        "promotions": {"email": false, "sms": false}
    }',
    stripe_customer_id TEXT,
    loyalty_points INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. BUSES
-- =====================================================
CREATE TABLE IF NOT EXISTS buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    bus_type TEXT NOT NULL,
    total_seats INTEGER NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    features JSONB DEFAULT '{
        "ac": true,
        "wifi": false,
        "charging_point": true,
        "entertainment": false,
        "washroom": false,
        "water_bottle": true
    }',
    images TEXT[] DEFAULT '{}',
    registration_document TEXT,
    insurance_document TEXT,
    fitness_certificate TEXT,
    permit_document TEXT,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    manufacturer TEXT,
    model_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. SEAT LAYOUTS
-- =====================================================
CREATE TABLE IF NOT EXISTS seat_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
    layout_data JSONB NOT NULL,
    is_template BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. ROUTES
-- =====================================================
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    origin_code TEXT,
    destination_code TEXT,
    origin_lat DECIMAL(10,8),
    origin_lng DECIMAL(11,8),
    dest_lat DECIMAL(10,8),
    dest_lng DECIMAL(11,8),
    distance_km DECIMAL(10,2),
    estimated_duration_minutes INTEGER,
    stops JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    route_geometry GEOMETRY(LineString, 4326),
    popular_searches INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. TRIPS
-- =====================================================
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id),
    bus_id UUID REFERENCES buses(id),
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    dynamic_pricing_config JSONB DEFAULT '{
        "peak_hour_factor": 1.2,
        "last_minute_factor": 1.3,
        "early_bird_factor": 0.85,
        "max_demand_factor": 1.5,
        "min_price": 100,
        "max_price": 5000
    }',
    status trip_status DEFAULT 'scheduled',
    available_seats INTEGER,
    total_seats INTEGER,
    cancellations_allowed_until_hours INTEGER DEFAULT 2,
    refund_percentage INTEGER DEFAULT 80,
    boarding_points JSONB DEFAULT '[]',
    dropping_points JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_departure_time ON trips(departure_time);
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON trips(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_bus_id ON trips(bus_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_departure_date ON trips(DATE(departure_time));

-- =====================================================
-- 7. BOOKINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE DEFAULT 'BK' || UPPER(SUBSTRING(MD5(random()::text) FOR 8)),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id),
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    stripe_session_id TEXT,
    qr_code_url TEXT,
    passenger_details JSONB NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    special_requests TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    refund_amount DECIMAL(10,2),
    refund_transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);

-- =====================================================
-- 8. BOOKING SEATS (Denormalized for performance)
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    seat_label TEXT NOT NULL,
    passenger_name TEXT NOT NULL,
    passenger_age INTEGER,
    passenger_gender TEXT,
    price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. TEMPORARY SEAT LOCKS (for real-time booking)
-- =====================================================
CREATE TABLE IF NOT EXISTS seat_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    seat_label TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id),
    session_id TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trip_id, seat_label)
);

CREATE INDEX IF NOT EXISTS idx_seat_locks_expires_at ON seat_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_seat_locks_session_id ON seat_locks(session_id);

-- =====================================================
-- 10. STAFF
-- =====================================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    staff_type user_role NOT NULL,
    employee_id TEXT UNIQUE,
    license_number TEXT,
    experience_years INTEGER,
    joining_date DATE,
    salary DECIMAL(10,2),
    shift_timing JSONB,
    emergency_contact JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. TRIP STAFF ASSIGNMENT
-- =====================================================
CREATE TABLE IF NOT EXISTS trip_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id),
    role TEXT NOT NULL,
    attendance_status TEXT DEFAULT 'pending',
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 12. NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- =====================================================
-- 13. AUDIT LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. DYNAMIC PRICING LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS pricing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id),
    booked_seats INTEGER,
    available_seats INTEGER,
    current_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    adjustment_reason TEXT,
    demand_factor DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 15. REVIEWS & RATINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    trip_id UUID REFERENCES trips(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 16. COUPONS & DISCOUNTS
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL, -- percentage, fixed
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 17. ANALYTICS VIEWS
-- =====================================================
CREATE OR REPLACE VIEW daily_bookings_analytics AS
SELECT
    DATE(b.created_at) as date,
    COUNT(DISTINCT b.id) as total_bookings,
    SUM(b.final_amount) as total_revenue,
    COUNT(DISTINCT b.user_id) as unique_customers,
    AVG(b.final_amount) as avg_booking_value
FROM bookings b
WHERE b.status = 'confirmed'
GROUP BY DATE(b.created_at);

CREATE OR REPLACE VIEW route_popularity AS
SELECT
    r.origin,
    r.destination,
    COUNT(b.id) as total_bookings,
    SUM(b.final_amount) as total_revenue,
    AVG(b.final_amount) as avg_price
FROM routes r
JOIN trips t ON t.route_id = r.id
JOIN bookings b ON b.trip_id = t.id
WHERE b.status = 'confirmed'
GROUP BY r.origin, r.destination;

CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    base_price NUMERIC(10,2) NOT NULL,
    dynamic_pricing_config JSONB NOT NULL DEFAULT '{"peak_hour_factor":1.2,"last_minute_factor":1.3,"early_bird_factor":0.85,"max_demand_factor":1.5,"min_price":100,"max_price":5000}'::jsonb,
    status trip_status NOT NULL DEFAULT 'scheduled',
    available_seats INTEGER,
    total_seats INTEGER,
    cancellations_allowed_until_hours INTEGER NOT NULL DEFAULT 2,
    refund_percentage INTEGER NOT NULL DEFAULT 80,
    boarding_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    dropping_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT NOT NULL UNIQUE DEFAULT 'BK' || UPPER(SUBSTRING(MD5(random()::text) FOR 8)),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    total_amount NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    final_amount NUMERIC(10,2) NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    stripe_session_id TEXT,
    qr_code_url TEXT,
    passenger_details JSONB NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    special_requests TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    refund_amount NUMERIC(10,2),
    refund_transaction_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_label TEXT NOT NULL,
    passenger_name TEXT NOT NULL,
    passenger_age INTEGER,
    passenger_gender TEXT,
    price NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seat_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    seat_label TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(trip_id, seat_label)
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    transaction_id TEXT NOT NULL,
    gateway TEXT NOT NULL DEFAULT 'stripe',
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'inr',
    status TEXT NOT NULL,
    gateway_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    staff_type user_role NOT NULL,
    employee_id TEXT UNIQUE,
    license_number TEXT,
    experience_years INTEGER,
    joining_date DATE,
    salary NUMERIC(10,2),
    shift_timing JSONB,
    emergency_contact JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    attendance_status TEXT NOT NULL DEFAULT 'pending',
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    booked_seats INTEGER NOT NULL DEFAULT 0,
    available_seats INTEGER NOT NULL DEFAULT 0,
    current_price NUMERIC(10,2) NOT NULL,
    new_price NUMERIC(10,2) NOT NULL,
    adjustment_reason TEXT,
    demand_factor NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL,
    discount_value NUMERIC(10,2) NOT NULL,
    min_purchase_amount NUMERIC(10,2),
    max_discount_amount NUMERIC(10,2),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    usage_limit INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_departure_time ON trips(departure_time);
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON trips(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_bus_id ON trips(bus_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_seat_locks_trip_id ON seat_locks(trip_id);
CREATE INDEX IF NOT EXISTS idx_seat_locks_expires_at ON seat_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

CREATE OR REPLACE VIEW daily_bookings_analytics AS
SELECT
    DATE(b.created_at) AS date,
    COUNT(DISTINCT b.id) AS total_bookings,
    COALESCE(SUM(b.final_amount), 0) AS total_revenue,
    COUNT(DISTINCT b.user_id) AS unique_customers,
    COALESCE(AVG(b.final_amount), 0) AS avg_booking_value
FROM bookings b
WHERE b.status = 'confirmed'
GROUP BY DATE(b.created_at);

CREATE OR REPLACE VIEW route_popularity AS
SELECT
    r.origin,
    r.destination,
    COUNT(b.id) AS total_bookings,
    COALESCE(SUM(b.final_amount), 0) AS total_revenue,
    COALESCE(AVG(b.final_amount), 0) AS avg_price
FROM routes r
JOIN trips t ON t.route_id = r.id
JOIN bookings b ON b.trip_id = t.id
WHERE b.status = 'confirmed'
GROUP BY r.origin, r.destination;
