CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        NEW.raw_user_meta_data ->> 'phone',
        'customer'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        updated_at = NOW();

    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_buses_updated_at ON buses;
CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON buses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_seat_layouts_updated_at ON seat_layouts;
CREATE TRIGGER update_seat_layouts_updated_at BEFORE UPDATE ON seat_layouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION lock_seats(
    p_trip_id UUID,
    p_seat_labels TEXT[],
    p_session_id TEXT,
    p_duration_minutes INTEGER DEFAULT 5
)
RETURNS TABLE(locked_seats TEXT[], failed_seats TEXT[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_seat_label TEXT;
    v_inserted_label TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    v_expires_at := NOW() + make_interval(mins => p_duration_minutes);
    locked_seats := ARRAY[]::TEXT[];
    failed_seats := ARRAY[]::TEXT[];

    DELETE FROM seat_locks WHERE expires_at <= NOW();

    FOREACH v_seat_label IN ARRAY p_seat_labels
    LOOP
        v_inserted_label := NULL;

        INSERT INTO seat_locks (trip_id, seat_label, user_id, session_id, expires_at)
        VALUES (p_trip_id, v_seat_label, auth.uid(), p_session_id, v_expires_at)
        ON CONFLICT (trip_id, seat_label) DO NOTHING
        RETURNING seat_label INTO v_inserted_label;

        IF v_inserted_label IS NOT NULL THEN
            locked_seats := array_append(locked_seats, v_inserted_label);
        ELSE
            failed_seats := array_append(failed_seats, v_seat_label);
        END IF;
    END LOOP;

    RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION release_expired_locks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM seat_locks
        WHERE expires_at <= NOW()
        RETURNING 1
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;

    RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_dynamic_price(
    p_base_price NUMERIC,
    p_available_seats INTEGER,
    p_total_seats INTEGER,
    p_days_until_departure INTEGER,
    p_hour_of_departure INTEGER
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    demand_factor NUMERIC := 1.0;
    time_factor NUMERIC := 1.0;
    final_price NUMERIC;
BEGIN
    IF p_total_seats > 0 THEN
        demand_factor := 1.0 + ((p_total_seats - p_available_seats)::NUMERIC / p_total_seats) * 0.5;
    END IF;

    IF p_hour_of_departure = ANY(ARRAY[7, 8, 9, 17, 18, 19, 20, 21]) THEN
        time_factor := 1.2;
    END IF;

    IF p_days_until_departure < 1 THEN
        demand_factor := demand_factor * 1.3;
    ELSIF p_days_until_departure < 3 THEN
        demand_factor := demand_factor * 1.15;
    ELSIF p_days_until_departure > 14 THEN
        demand_factor := demand_factor * 0.85;
    END IF;

    final_price := ROUND((p_base_price * demand_factor * time_factor) / 10) * 10;
    final_price := GREATEST(final_price, p_base_price * 0.7);
    final_price := LEAST(final_price, p_base_price * 1.8);

    RETURN final_price;
END;
$$;

CREATE OR REPLACE FUNCTION sync_trip_availability(p_trip_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_seats INTEGER;
    v_booked_seats INTEGER;
BEGIN
    SELECT total_seats INTO v_total_seats
    FROM trips
    WHERE id = p_trip_id;

    SELECT COUNT(*)
    INTO v_booked_seats
    FROM bookings b
    JOIN booking_seats bs ON bs.booking_id = b.id
    WHERE b.trip_id = p_trip_id
      AND b.status = 'confirmed';

    UPDATE trips
    SET available_seats = GREATEST(COALESCE(v_total_seats, 0) - COALESCE(v_booked_seats, 0), 0),
        updated_at = NOW()
    WHERE id = p_trip_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_trip_prices()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_trip RECORD;
    v_available_seats INTEGER;
    v_new_price NUMERIC;
    v_days_until INTEGER;
    v_hour_of_departure INTEGER;
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status <> 'confirmed')
       OR (TG_OP = 'UPDATE' AND NEW.status <> 'confirmed') THEN
        RETURN NEW;
    END IF;

    SELECT t.*,
           (
               SELECT COUNT(*)
               FROM bookings b
               JOIN booking_seats bs ON bs.booking_id = b.id
               WHERE b.trip_id = t.id
                 AND b.status = 'confirmed'
           ) AS booked
    INTO v_trip
    FROM trips t
    WHERE t.id = NEW.trip_id;

    v_available_seats := GREATEST(COALESCE(v_trip.total_seats, 0) - COALESCE(v_trip.booked, 0), 0);
    v_days_until := GREATEST(FLOOR(EXTRACT(EPOCH FROM (v_trip.departure_time - NOW())) / 86400), 0);
    v_hour_of_departure := EXTRACT(HOUR FROM v_trip.departure_time);

    v_new_price := calculate_dynamic_price(
        v_trip.base_price,
        v_available_seats,
        COALESCE(v_trip.total_seats, 0),
        v_days_until,
        v_hour_of_departure
    );

    INSERT INTO pricing_logs (
        trip_id,
        booked_seats,
        available_seats,
        current_price,
        new_price,
        adjustment_reason,
        demand_factor
    ) VALUES (
        NEW.trip_id,
        COALESCE(v_trip.booked, 0),
        v_available_seats,
        v_trip.base_price,
        v_new_price,
        CASE WHEN TG_OP = 'INSERT' THEN 'booking_created' ELSE 'booking_updated' END,
        CASE
            WHEN COALESCE(v_trip.total_seats, 0) = 0 THEN 1
            ELSE ROUND(1 + ((COALESCE(v_trip.booked, 0)::NUMERIC / v_trip.total_seats) * 0.5), 2)
        END
    );

    UPDATE trips
    SET base_price = v_new_price,
        available_seats = v_available_seats,
        updated_at = NOW()
    WHERE id = NEW.trip_id;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION generate_qr_code_url(p_booking_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (
        SELECT CASE
            WHEN qr_code_url IS NOT NULL THEN qr_code_url
            ELSE 'https://your-project.supabase.co/storage/v1/object/public/qr-codes/' || p_booking_id || '.png'
        END
        FROM bookings
        WHERE id = p_booking_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION get_available_seats(p_trip_id UUID)
RETURNS TABLE(seat_label TEXT, is_available BOOLEAN, is_locked BOOLEAN)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH trip_layout AS (
        SELECT COALESCE(layout.layout_data, template.layout_data) AS layout_data
        FROM trips t
        LEFT JOIN seat_layouts layout
            ON layout.bus_id = t.bus_id AND layout.is_active = TRUE
        LEFT JOIN LATERAL (
            SELECT sl.layout_data
            FROM seat_layouts sl
            WHERE sl.is_template = TRUE AND sl.is_active = TRUE
            ORDER BY sl.created_at DESC
            LIMIT 1
        ) template ON TRUE
        WHERE t.id = p_trip_id
        LIMIT 1
    ),
    layout_seats AS (
        SELECT jsonb_array_elements(layout_data -> 'seats') ->> 'label' AS seat_label
        FROM trip_layout
    ),
    booked_seats AS (
        SELECT bs.seat_label
        FROM bookings b
        JOIN booking_seats bs ON bs.booking_id = b.id
        WHERE b.trip_id = p_trip_id AND b.status = 'confirmed'
    ),
    live_locks AS (
        SELECT seat_label
        FROM seat_locks
        WHERE trip_id = p_trip_id AND expires_at > NOW()
    )
    SELECT
        ls.seat_label,
        (bs.seat_label IS NULL) AS is_available,
        (ll.seat_label IS NOT NULL) AS is_locked
    FROM layout_seats ls
    LEFT JOIN booked_seats bs ON bs.seat_label = ls.seat_label
    LEFT JOIN live_locks ll ON ll.seat_label = ls.seat_label
    ORDER BY ls.seat_label;
END;
$$;

DROP TRIGGER IF EXISTS update_price_on_booking_insert ON bookings;
CREATE TRIGGER update_price_on_booking_insert
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_trip_prices();

DROP TRIGGER IF EXISTS update_price_on_booking_update ON bookings;
CREATE TRIGGER update_price_on_booking_update
    AFTER UPDATE OF status ON bookings
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_trip_prices();
