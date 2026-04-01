-- ============================================================================
-- BUS AGENCY MANAGEMENT SYSTEM (FULL FIXED VERSION)
-- ============================================================================

-- ================= EXTENSIONS =================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================= ENUMS =================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin','agent','customer','driver','conductor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending','confirmed','cancelled','refunded','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('scheduled','boarding','departed','arrived','cancelled','delayed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending','succeeded','failed','refunded','partially_refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ================= TABLES =================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    bus_type TEXT NOT NULL,
    total_seats INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin TEXT NOT NULL,
    destination TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id),
    bus_id UUID REFERENCES buses(id),
    departure_time TIMESTAMPTZ,
    arrival_time TIMESTAMPTZ,
    base_price DECIMAL,
    total_seats INTEGER,
    available_seats INTEGER,
    status trip_status DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE,
    user_id UUID REFERENCES profiles(id),
    trip_id UUID REFERENCES trips(id),
    total_amount DECIMAL,
    final_amount DECIMAL,
    status booking_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    seat_label TEXT
);

CREATE TABLE IF NOT EXISTS seat_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id),
    seat_label TEXT,
    expires_at TIMESTAMPTZ,
    UNIQUE(trip_id, seat_label)
);

-- ================= SAFE FUNCTION =================

DROP FUNCTION IF EXISTS get_available_seats(UUID);

CREATE FUNCTION get_available_seats(p_trip_id UUID)
RETURNS TABLE(
    seat_label TEXT,
    is_available BOOLEAN,
    is_locked BOOLEAN,
    price DECIMAL
) AS $$
BEGIN
    -- NOTE: This placeholder should be replaced with a real implementation that
    -- computes availability from seat layouts, locks, and bookings.
    RETURN QUERY
    SELECT 
        'A1'::TEXT,
        TRUE,
        FALSE,
        1000;
END;
$$ LANGUAGE plpgsql;

-- ================= TRIGGERS =================

DROP TRIGGER IF EXISTS generate_booking_reference_trigger ON bookings;
DROP FUNCTION IF EXISTS generate_booking_reference();

CREATE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_reference := 'BK' || SUBSTRING(MD5(NEW.id::TEXT) FOR 8);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_booking_reference_trigger
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION generate_booking_reference();

-- ================= SEED DATA (FIXED) =================

-- BUS (FIXED: all required fields included)
INSERT INTO buses (name, registration_number, bus_type, total_seats)
VALUES 
('Shamolly Express', 'BR01AB1234', 'AC Sleeper', 40),
('Shamolly Premium', 'BR02CD5678', 'Volvo AC', 44)
ON CONFLICT (registration_number) DO NOTHING;

-- ROUTES
INSERT INTO routes (origin, destination)
VALUES 
('Delhi','Jaipur'),
('Mumbai','Goa')
ON CONFLICT DO NOTHING;

-- TRIPS (SAFE INSERT)
INSERT INTO trips (route_id, bus_id, departure_time, arrival_time, base_price, total_seats, available_seats)
SELECT 
    r.id,
    b.id,
    NOW(),
    NOW() + INTERVAL '5 hour',
    1000,
    b.total_seats,
    b.total_seats
FROM routes r
JOIN buses b ON TRUE
LIMIT 5
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END
-- ============================================================================
