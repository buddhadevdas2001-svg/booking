-- =====================================================
-- BUS AGENCY MANAGEMENT SYSTEM - CLEAN SETUP SCHEMA
-- WARNING: This script drops and recreates tables!
-- =====================================================

-- 1. DROP EXISTING TABLES (Ensures a clean slate)
DROP TABLE IF EXISTS public.pricing_logs CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.trip_staff CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.seat_locks CASCADE;
DROP TABLE IF EXISTS public.booking_seats CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.routes CASCADE;
DROP TABLE IF EXISTS public.seat_layouts CASCADE;
DROP TABLE IF EXISTS public.buses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- 2. ENUMS
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
-- 3. TABLES
-- =====================================================

-- PROFILES
CREATE TABLE public.profiles (
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
    last_sign_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUSES
CREATE TABLE public.buses (
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

-- SEAT LAYOUTS
CREATE TABLE public.seat_layouts (
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

-- ROUTES
CREATE TABLE public.routes (
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
    route_geometry public.GEOMETRY(LineString, 4326),
    popular_searches INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRIPS
CREATE TABLE public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
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
    live_tracking JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOOKINGS
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE DEFAULT 'BK' || UPPER(LEFT(REPLACE(gen_random_uuid()::text, '-', ''), 10)),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
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

-- BOOKING SEATS
CREATE TABLE public.booking_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    seat_label TEXT NOT NULL,
    passenger_name TEXT NOT NULL,
    passenger_age INTEGER,
    passenger_gender TEXT,
    price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEAT LOCKS
CREATE TABLE public.seat_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    seat_label TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id),
    session_id TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trip_id, seat_label)
);

-- PAYMENTS
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
    transaction_id TEXT NOT NULL,
    gateway TEXT NOT NULL DEFAULT 'stripe',
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'inr',
    status TEXT NOT NULL,
    gateway_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STAFF
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- TRIP STAFF ASSIGNMENT
CREATE TABLE public.trip_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    attendance_status TEXT DEFAULT 'pending',
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ
);

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
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

-- PRICING LOGS
CREATE TABLE public.pricing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    booked_seats INTEGER,
    available_seats INTEGER,
    current_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    adjustment_reason TEXT,
    demand_factor DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COUPONS
CREATE TABLE public.coupons (
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

-- OFFERS (Marketing / promotional surface)
CREATE TABLE public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL, -- percentage or fixed
    discount_value DECIMAL(10,2) NOT NULL,
    min_booking_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. INDEXES
-- =====================================================
CREATE INDEX idx_trips_departure_time ON public.trips(departure_time);
CREATE INDEX idx_trips_route_id ON public.trips(route_id);
CREATE INDEX idx_trips_bus_id ON public.trips(bus_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_trip_id ON public.bookings(trip_id);
CREATE INDEX idx_booking_seats_booking_id ON public.booking_seats(booking_id);
CREATE INDEX idx_seat_locks_expires_at ON public.seat_locks(expires_at);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_routes_origin_destination ON public.routes(origin, destination);
CREATE INDEX idx_seat_layouts_bus_id ON public.seat_layouts(bus_id);
CREATE INDEX idx_trip_staff_trip_id ON public.trip_staff(trip_id);
CREATE INDEX idx_trip_staff_staff_id ON public.trip_staff(staff_id);

-- =====================================================
-- 5. VIEWS
-- =====================================================
CREATE OR REPLACE VIEW public.daily_bookings_analytics AS
SELECT
    DATE(b.created_at) as date,
    COUNT(DISTINCT b.id) as total_bookings,
    SUM(b.final_amount) as total_revenue,
    COUNT(DISTINCT b.user_id) as unique_customers,
    AVG(b.final_amount) as avg_booking_value
FROM public.bookings b
WHERE b.status = 'confirmed'
GROUP BY DATE(b.created_at);

CREATE OR REPLACE VIEW public.route_popularity AS
SELECT
    r.origin,
    r.destination,
    COUNT(b.id) as total_bookings,
    SUM(b.final_amount) as total_revenue,
    AVG(b.final_amount) as avg_price
FROM public.routes r
JOIN public.trips t ON t.route_id = r.id
JOIN public.bookings b ON b.trip_id = t.id
WHERE b.status = 'confirmed'
GROUP BY r.origin, r.destination;

-- =====================================================
-- 6. STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('bus-images', 'bus-images', true),
    ('qr-codes', 'qr-codes', true),
    ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. SECURITY (RLS)
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_logs ENABLE ROW LEVEL SECURITY;


-- ADMIN HELPER (Moved to public schema to avoid perm issues)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check JWT metadata first (fastest)
    IF (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'agent') THEN
        RETURN TRUE;
    END IF;
    -- Fallback to profiles table if metadata isn't set (SECURITY DEFINER bypasses RLS)
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'agent')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone',
        'customer',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- POLICIES (Consolidated)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view active buses" ON public.buses;
CREATE POLICY "Anyone can view active buses" ON public.buses FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage buses" ON public.buses;
CREATE POLICY "Admin can manage buses" ON public.buses FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view trips" ON public.trips;
CREATE POLICY "Anyone can view trips" ON public.trips FOR SELECT USING (status != 'cancelled');

DROP POLICY IF EXISTS "Anyone can view routes" ON public.routes;
DROP POLICY IF EXISTS "Anyone can view active routes" ON public.routes;
CREATE POLICY "Anyone can view routes" ON public.routes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view active seat layouts" ON public.seat_layouts;
CREATE POLICY "Anyone can view active seat layouts" ON public.seat_layouts FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);

-- Offers visibility + management
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active offers" ON public.offers;
CREATE POLICY "Anyone can view active offers" ON public.offers FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage offers" ON public.offers;
CREATE POLICY "Admin can manage offers" ON public.offers FOR ALL USING (public.is_admin());

-- BOOKINGS RLS
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT WITH CHECK (
    (user_id = auth.uid()) OR (public.is_admin())
);

CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (
    (user_id = auth.uid()) OR (public.is_admin())
);

DROP POLICY IF EXISTS "Users can delete own bookings" ON public.bookings;
CREATE POLICY "Users can delete own bookings" ON public.bookings FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- BOOKING SEATS RLS
CREATE POLICY "Users can view booking seats for own bookings" ON public.booking_seats FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.bookings b 
        WHERE b.id = public.booking_seats.booking_id 
        AND (b.user_id = auth.uid() OR public.is_admin())
    )
);

DROP POLICY IF EXISTS "Users can create booking seats for own bookings" ON public.booking_seats;
CREATE POLICY "Users can create booking seats for own bookings" ON public.booking_seats FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.is_admin()))
);

DROP POLICY IF EXISTS "Users can update booking seats for own bookings" ON public.booking_seats;
CREATE POLICY "Users can update booking seats for own bookings" ON public.booking_seats FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.is_admin()))
);

DROP POLICY IF EXISTS "Users can delete booking seats for own bookings" ON public.booking_seats;
CREATE POLICY "Users can delete booking seats for own bookings" ON public.booking_seats FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.is_admin()))
);

-- PAYMENTS RLS (admin only)
DROP POLICY IF EXISTS "Admin can manage payments" ON public.payments;
CREATE POLICY "Admin can manage payments" ON public.payments FOR ALL USING (public.is_admin());

-- TRIP STAFF RLS (admin only)
DROP POLICY IF EXISTS "Admin can manage trip_staff" ON public.trip_staff;
CREATE POLICY "Admin can manage trip_staff" ON public.trip_staff FOR ALL USING (public.is_admin());

-- AUDIT LOGS RLS (admin only)
DROP POLICY IF EXISTS "Admin can view audit logs" ON public.audit_logs;
CREATE POLICY "Admin can view audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admin can manage audit logs" ON public.audit_logs;
CREATE POLICY "Admin can manage audit logs" ON public.audit_logs FOR ALL USING (public.is_admin());

-- PRICING LOGS RLS (admin only)
DROP POLICY IF EXISTS "Admin can view pricing logs" ON public.pricing_logs;
CREATE POLICY "Admin can view pricing logs" ON public.pricing_logs FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admin can manage pricing logs" ON public.pricing_logs;
CREATE POLICY "Admin can manage pricing logs" ON public.pricing_logs FOR ALL USING (public.is_admin());

-- SEAT LOCKS RLS (allow clients to observe active locks for realtime seat maps)
DROP POLICY IF EXISTS "Anyone can view active seat locks" ON public.seat_locks;
CREATE POLICY "Anyone can view active seat locks" ON public.seat_locks
FOR SELECT
USING (expires_at > NOW());

-- Seat availability helper for API/RPC
CREATE OR REPLACE FUNCTION public.get_available_seats(p_trip_id UUID)
RETURNS TABLE (
    seat_label TEXT,
    is_available BOOLEAN,
    is_locked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    layout JSONB;
BEGIN
    SELECT sl.layout_data
    INTO layout
    FROM public.trips t
    JOIN public.seat_layouts sl ON sl.bus_id = t.bus_id
    WHERE t.id = p_trip_id
    ORDER BY sl.is_active DESC, sl.updated_at DESC
    LIMIT 1;

    IF layout IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        (seat ->> 'label')::TEXT AS seat_label,
        NOT EXISTS (
            SELECT 1
            FROM public.booking_seats bs
            JOIN public.bookings b ON b.id = bs.booking_id
            WHERE b.trip_id = p_trip_id
              AND bs.seat_label = seat ->> 'label'
              AND b.status = 'confirmed'
        ) AS is_available,
        EXISTS (
            SELECT 1
            FROM public.seat_locks slk
            WHERE slk.trip_id = p_trip_id
              AND slk.seat_label = seat ->> 'label'
              AND slk.expires_at > NOW()
        ) AS is_locked
    FROM jsonb_array_elements(layout -> 'seats') seat
    WHERE seat ->> 'type' IS DISTINCT FROM 'empty';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_available_seats(UUID) TO anon, authenticated, service_role;

-- Seat lock helper for realtime booking flows
CREATE OR REPLACE FUNCTION public.lock_seats(
    p_trip_id UUID,
    p_seat_labels TEXT[],
    p_session_id TEXT,
    p_duration_minutes INTEGER DEFAULT 5
)
RETURNS TABLE (
    locked_seats TEXT[],
    failed_seats TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_seat_label TEXT;
    now_ts TIMESTAMPTZ := NOW();
    expires_ts TIMESTAMPTZ := NOW() + make_interval(mins => GREATEST(COALESCE(p_duration_minutes, 5), 1));
    v_locked TEXT[] := ARRAY[]::TEXT[];
    v_failed TEXT[] := ARRAY[]::TEXT[];
    existing_lock RECORD;
BEGIN
    IF p_trip_id IS NULL OR p_session_id IS NULL OR array_length(p_seat_labels, 1) IS NULL THEN
        RETURN QUERY SELECT ARRAY[]::TEXT[], COALESCE(p_seat_labels, ARRAY[]::TEXT[]);
        RETURN;
    END IF;

    DELETE FROM public.seat_locks
    WHERE trip_id = p_trip_id
      AND seat_label = ANY(p_seat_labels)
      AND expires_at <= now_ts;

    FOREACH v_seat_label IN ARRAY p_seat_labels LOOP
        IF EXISTS (
            SELECT 1
            FROM public.booking_seats bs
            JOIN public.bookings b ON b.id = bs.booking_id
            WHERE b.trip_id = p_trip_id
              AND b.status = 'confirmed'
              AND bs.seat_label = v_seat_label
        ) THEN
            v_failed := array_append(v_failed, v_seat_label);
            CONTINUE;
        END IF;

        SELECT id, session_id
        INTO existing_lock
        FROM public.seat_locks
        WHERE trip_id = p_trip_id
          AND seat_label = v_seat_label
          AND expires_at > now_ts
        LIMIT 1;

        IF existing_lock.id IS NOT NULL AND existing_lock.session_id <> p_session_id THEN
            v_failed := array_append(v_failed, v_seat_label);
            CONTINUE;
        END IF;

        IF existing_lock.id IS NOT NULL THEN
            UPDATE public.seat_locks
            SET expires_at = expires_ts
            WHERE id = existing_lock.id;
        ELSE
            INSERT INTO public.seat_locks (trip_id, seat_label, session_id, expires_at)
            VALUES (p_trip_id, v_seat_label, p_session_id, expires_ts)
            ON CONFLICT (trip_id, seat_label) DO NOTHING;

            IF NOT EXISTS (
                SELECT 1
                FROM public.seat_locks
                WHERE trip_id = p_trip_id
                  AND seat_label = v_seat_label
                  AND session_id = p_session_id
                  AND expires_at = expires_ts
            ) THEN
                v_failed := array_append(v_failed, v_seat_label);
                CONTINUE;
            END IF;
        END IF;

        v_locked := array_append(v_locked, v_seat_label);
    END LOOP;

    RETURN QUERY SELECT v_locked, v_failed;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lock_seats(UUID, TEXT[], TEXT, INTEGER) TO anon, authenticated, service_role;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- SEED DATA (Minimal)
-- The rest should be handled by /seed

-- =====================================================
-- 8. GRANTS & DEFAULT PRIVILEGES
-- =====================================================
-- Ensure Supabase roles can use the public schema and tables.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Client roles: allow reads everywhere; writes go through RLS.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Future objects inherit the same privileges.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
