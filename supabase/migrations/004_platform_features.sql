CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "postgis";

ALTER TABLE IF EXISTS routes
    ADD COLUMN IF NOT EXISTS route_geometry geometry(LineString, 4326);

ALTER TABLE IF EXISTS trips
    ADD COLUMN IF NOT EXISTS search_embedding vector(1536);

ALTER TABLE IF EXISTS trips
    ADD COLUMN IF NOT EXISTS live_tracking JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS profiles
    ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

INSERT INTO storage.buckets (id, name, public)
VALUES
    ('bus-images', 'bus-images', true),
    ('qr-codes', 'qr-codes', true),
    ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;


DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_bus_images_select'
    ) THEN
        CREATE POLICY "storage_bus_images_select"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'bus-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_bus_images_insert'
    ) THEN
        CREATE POLICY "storage_bus_images_insert"
            ON storage.objects FOR INSERT
            WITH CHECK (bucket_id = 'bus-images' AND auth.is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_qr_codes_select'
    ) THEN
        CREATE POLICY "storage_qr_codes_select"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'qr-codes');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_qr_codes_insert'
    ) THEN
        CREATE POLICY "storage_qr_codes_insert"
            ON storage.objects FOR INSERT
            WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'service_role');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'storage_documents_admin_all'
    ) THEN
        CREATE POLICY "storage_documents_admin_all"
            ON storage.objects FOR ALL
            USING (bucket_id = 'documents' AND auth.is_admin())
            WITH CHECK (bucket_id = 'documents' AND auth.is_admin());
    END IF;
END
$$;

ALTER TABLE seat_locks REPLICA IDENTITY FULL;
ALTER TABLE bookings REPLICA IDENTITY FULL;
ALTER TABLE trips REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE seat_locks, bookings, trips;
    ELSE
        CREATE PUBLICATION supabase_realtime FOR TABLE seat_locks, bookings, trips;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

CREATE OR REPLACE VIEW public.bookings_masked AS
SELECT
    id,
    booking_reference,
    trip_id,
    total_amount,
    status,
    regexp_replace(contact_email, '(?<=.{3}).(?=.*@)', '*', 'g') AS contact_email,
    regexp_replace(contact_phone, '(?<=.{3}).(?=.{4})', '*', 'g') AS contact_phone,
    created_at
FROM bookings;

DROP MATERIALIZED VIEW IF EXISTS dashboard_stats;
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT
    COUNT(DISTINCT b.id) AS total_bookings,
    COALESCE(SUM(b.final_amount), 0) AS total_revenue,
    COUNT(DISTINCT b.user_id) AS total_customers,
    COUNT(DISTINCT t.bus_id) AS active_buses,
    COALESCE(AVG(r.rating), 0) AS avg_rating
FROM bookings b
JOIN trips t ON t.id = b.trip_id
LEFT JOIN reviews r ON r.booking_id = b.id
WHERE b.status = 'confirmed'
  AND b.created_at > NOW() - INTERVAL '30 days';

CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_singleton
    ON dashboard_stats ((true));
