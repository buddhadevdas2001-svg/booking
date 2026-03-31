-- ============================================================================
-- Bus Agency Delta: seat layouts, pricing, staff, payments, availability
-- ============================================================================

-- Seat layouts (templates + bus-bound)
CREATE TABLE IF NOT EXISTS seat_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id UUID REFERENCES buses(id),
    name TEXT NOT NULL,
    layout_data JSONB NOT NULL,
    is_template BOOLEAN DEFAULT FALSE,
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips: link to specific seat layout + pricing knobs
ALTER TABLE trips
    ADD COLUMN IF NOT EXISTS seat_layout_id UUID REFERENCES seat_layouts(id),
    ADD COLUMN IF NOT EXISTS demand_factor NUMERIC DEFAULT 1,
    ADD COLUMN IF NOT EXISTS dynamic_pricing JSONB DEFAULT '{}'::JSONB;

-- Seat locks: enrich with session/user + created_at
ALTER TABLE seat_locks
    ADD COLUMN IF NOT EXISTS session_id TEXT,
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Payments table aligned with UI expectations
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE,
    gateway TEXT DEFAULT 'stripe',
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    status payment_status DEFAULT 'pending',
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers / promos
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    amount_off NUMERIC,
    percent_off NUMERIC,
    min_amount NUMERIC,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    max_uses INT,
    per_user_uses INT,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff directory (for drivers/conductors/agents)
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'driver',
    phone TEXT,
    license_number TEXT,
    experience_years INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip staff assignments
CREATE TABLE IF NOT EXISTS trip_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    role user_role,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trip_id, staff_id, role)
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity TEXT,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Replace availability function with real logic
DROP FUNCTION IF EXISTS get_available_seats(UUID);
CREATE OR REPLACE FUNCTION get_available_seats(p_trip_id UUID)
RETURNS TABLE(
    seat_label TEXT,
    is_available BOOLEAN,
    is_locked BOOLEAN,
    is_booked BOOLEAN,
    price NUMERIC
) AS $$
WITH trip_data AS (
    SELECT t.id,
           t.base_price,
           COALESCE(t.dynamic_pricing, '{}'::jsonb) AS dyn,
           sl.layout_data
    FROM trips t
    LEFT JOIN seat_layouts sl ON sl.id = t.seat_layout_id
    WHERE t.id = p_trip_id
),
seats AS (
    SELECT (seat ->> 'label') AS seat_label,
           COALESCE((seat ->> 'price_multiplier')::numeric, 1) AS multiplier
    FROM trip_data,
         jsonb_array_elements(COALESCE(trip_data.layout_data -> 'seats', '[]'::jsonb)) AS seat
),
locks AS (
    SELECT seat_label
    FROM seat_locks
    WHERE trip_id = p_trip_id
      AND expires_at > NOW()
),
booked AS (
    SELECT bs.seat_label
    FROM booking_seats bs
    JOIN bookings b ON b.id = bs.booking_id
    WHERE b.trip_id = p_trip_id
      AND b.status = 'confirmed'
)
SELECT
    s.seat_label,
    (l.seat_label IS NULL AND bkd.seat_label IS NULL) AS is_available,
    l.seat_label IS NOT NULL AS is_locked,
    bkd.seat_label IS NOT NULL AS is_booked,
    (td.base_price * s.multiplier)::numeric AS price
FROM seats s
CROSS JOIN trip_data td
LEFT JOIN locks l ON l.seat_label = s.seat_label
LEFT JOIN booked bkd ON bkd.seat_label = s.seat_label;
$$ LANGUAGE sql STABLE;

-- Seed templates for layouts if none exist
INSERT INTO seat_layouts (name, layout_data, is_template, is_active)
VALUES
    (
        'Standard 2x2 Seater',
        '{"rows":10,"cols":4,"hasUpperDeck":false,"seats":[]}'::jsonb,
        TRUE,
        TRUE
    )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END
-- ============================================================================
