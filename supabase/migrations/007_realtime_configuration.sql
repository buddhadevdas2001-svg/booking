-- =====================================================
-- ENABLE REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for specific tables
ALTER TABLE seat_locks REPLICA IDENTITY FULL;
ALTER TABLE bookings REPLICA IDENTITY FULL;
ALTER TABLE trips REPLICA IDENTITY FULL;

-- Add tables to realtime publication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime
    FOR TABLE seat_locks, bookings, trips;
COMMIT;