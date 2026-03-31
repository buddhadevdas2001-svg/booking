-- =====================================================
-- COMPREHENSIVE DATABASE FUNCTIONS & TRIGGERS
-- =====================================================

-- =====================================================
-- UPDATE TIMESTAMP FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON buses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- AUTO CREATE PROFILE ON SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        'customer'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- LOCK SEATS FUNCTION (Real-time booking)
-- =====================================================
CREATE OR REPLACE FUNCTION lock_seats(
    p_trip_id UUID,
    p_seat_labels TEXT[],
    p_session_id TEXT,
    p_duration_minutes INTEGER DEFAULT 5
)
RETURNS TABLE(locked_seats TEXT[], failed_seats TEXT[]) AS $$
DECLARE
    v_seat_label TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    v_expires_at := NOW() + (p_duration_minutes * INTERVAL '1 minute');
    locked_seats := ARRAY[]::TEXT[];
    failed_seats := ARRAY[]::TEXT[];

    FOREACH v_seat_label IN ARRAY p_seat_labels
    LOOP
        BEGIN
            INSERT INTO seat_locks (trip_id, seat_label, user_id, session_id, expires_at)
            VALUES (p_trip_id, v_seat_label, auth.uid(), p_session_id, v_expires_at)
            ON CONFLICT (trip_id, seat_label) DO NOTHING
            RETURNING seat_label INTO v_seat_label;

            IF v_seat_label IS NOT NULL THEN
                locked_seats := array_append(locked_seats, v_seat_label);
            ELSE
                failed_seats := array_append(failed_seats, v_seat_label);
            END IF;
        EXCEPTION WHEN OTHERS THEN
            failed_seats := array_append(failed_seats, v_seat_label);
        END;
    END LOOP;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RELEASE EXPIRED LOCKS (Run via pg_cron or Edge Function)
-- =====================================================
CREATE OR REPLACE FUNCTION release_expired_locks()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM seat_locks
    WHERE expires_at < NOW()
    RETURNING COUNT(*) INTO deleted_count;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CALCULATE DYNAMIC PRICE
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_dynamic_price(
    p_base_price DECIMAL,
    p_available_seats INTEGER,
    p_total_seats INTEGER,
    p_days_until_departure INTEGER,
    p_hour_of_departure INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
    demand_factor DECIMAL;
    time_factor DECIMAL;
    final_price DECIMAL;
    peak_hours INTEGER[] := ARRAY[7,8,9,17,18,19,20,21];
BEGIN
    -- Demand factor: higher demand = higher price
    demand_factor := 1.0 + ((p_total_seats - p_available_seats)::DECIMAL / p_total_seats) * 0.5;

    -- Time factor for peak hours
    IF p_hour_of_departure = ANY(peak_hours) THEN
        time_factor := 1.2;
    ELSE
        time_factor := 1.0;
    END IF;

    -- Last minute factor
    IF p_days_until_departure < 1 THEN
        demand_factor := demand_factor * 1.3;
    ELSIF p_days_until_departure < 3 THEN
        demand_factor := demand_factor * 1.15;
    ELSIF p_days_until_departure > 14 THEN
        demand_factor := demand_factor * 0.85; -- Early bird discount
    END IF;

    final_price := p_base_price * demand_factor * time_factor;

    -- Round to nearest 10
    final_price := ROUND(final_price / 10) * 10;

    -- Ensure price within reasonable range
    final_price := GREATEST(final_price, p_base_price * 0.7);
    final_price := LEAST(final_price, p_base_price * 1.8);

    RETURN final_price;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATE TRIP PRICES (Trigger on booking)
-- =====================================================
CREATE OR REPLACE FUNCTION update_trip_prices()
RETURNS TRIGGER AS $$
DECLARE
    v_trip RECORD;
    v_available_seats INTEGER;
    v_new_price DECIMAL;
    v_days_until INTEGER;
    v_hour_of_departure INTEGER;
BEGIN
    -- Get trip details
    SELECT t.*,
           (SELECT COUNT(*) FROM bookings b
            JOIN booking_seats bs ON bs.booking_id = b.id
            WHERE b.trip_id = t.id AND b.status = 'confirmed') as booked
    INTO v_trip
    FROM trips t
    WHERE t.id = NEW.trip_id;

    v_available_seats := v_trip.total_seats - v_trip.booked;
    v_days_until := EXTRACT(DAY FROM (v_trip.departure_time - NOW()));
    v_hour_of_departure := EXTRACT(HOUR FROM v_trip.departure_time);

    v_new_price := calculate_dynamic_price(
        v_trip.base_price,
        v_available_seats,
        v_trip.total_seats,
        v_days_until,
        v_hour_of_departure
    );

    -- Log price change
    INSERT INTO pricing_logs (
        trip_id, booked_seats, available_seats,
        current_price, new_price, adjustment_reason
    ) VALUES (
        NEW.trip_id, v_trip.booked, v_available_seats,
        v_trip.base_price, v_new_price, 'booking_created'
    );

    -- Update trip price
    UPDATE trips SET base_price = v_new_price WHERE id = NEW.trip_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_price_on_booking
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_trip_prices();

-- =====================================================
-- GENERATE QR CODE URL
-- =====================================================
CREATE OR REPLACE FUNCTION generate_qr_code_url(p_booking_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_booking_data JSONB;
    v_qr_data TEXT;
BEGIN
    SELECT jsonb_build_object(
        'booking_id', id,
        'booking_reference', booking_reference,
        'trip_id', trip_id,
        'seats', (
            SELECT jsonb_agg(seat_label)
            FROM booking_seats
            WHERE booking_id = p_booking_id
        ),
        'user_name', (SELECT full_name FROM profiles WHERE id = user_id),
        'qr_generated_at', NOW()
    ) INTO v_booking_data
    FROM bookings
    WHERE id = p_booking_id;

    -- Return URL to QR code (will be generated by Edge Function)
    RETURN 'https://your-project.supabase.co/storage/v1/object/public/qr-codes/' || p_booking_id || '.png';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GET AVAILABLE SEATS FOR TRIP
-- =====================================================
CREATE OR REPLACE FUNCTION get_available_seats(p_trip_id UUID)
RETURNS TABLE(seat_label TEXT, is_available BOOLEAN, is_locked BOOLEAN, price DECIMAL) AS $$
BEGIN
    RETURN QUERY
    WITH layout_seats AS (
        SELECT
            jsonb_array_elements(sl.layout_data->'seats')->>'label' as seat_label
        FROM seat_layouts sl
        JOIN buses b ON b.id = sl.bus_id
        JOIN trips t ON t.bus_id = b.id
        WHERE t.id = p_trip_id
        AND sl.is_active = true
    ),
    booked_seats AS (
        SELECT bs.seat_label
        FROM bookings b
        JOIN booking_seats bs ON bs.booking_id = b.id
        WHERE b.trip_id = p_trip_id AND b.status = 'confirmed'
    ),
    locked_seats AS (
        SELECT seat_label
        FROM seat_locks
        WHERE trip_id = p_trip_id AND expires_at > NOW()
    )
    SELECT
        ls.seat_label,
        NOT (bs.seat_label IS NOT NULL) as is_available,
        (ls.seat_label IN (SELECT seat_label FROM locked_seats)) as is_locked,
        (SELECT base_price FROM trips WHERE id = p_trip_id) as price
    FROM layout_seats ls
    LEFT JOIN booked_seats bs ON bs.seat_label = ls.seat_label
    ORDER BY ls.seat_label;
END;
$$ LANGUAGE plpgsql;