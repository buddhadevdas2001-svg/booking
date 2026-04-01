-- =====================================================
-- COMPREHENSIVE RLS ENFORCEMENT & PLATFORM SECURITY
-- =====================================================


-- 1. Enable RLS on all existing tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS seat_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS booking_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS seat_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS trip_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing potentially conflicting policies to ensure a clean slate
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. Helper function for Admin/Staff check
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLICIES: PROFILES
-- =====================================================
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can do everything with profiles" ON profiles
    FOR ALL USING (auth.is_admin());

-- =====================================================
-- POLICIES: BUSES, ROUTES, SEAT_LAYOUTS (READ-ONLY PUBLIC, WRITE ADMIN)
-- =====================================================
CREATE POLICY "Buses are viewable by everyone" ON buses FOR SELECT USING (true);
CREATE POLICY "Admins manage buses" ON buses FOR ALL USING (auth.is_admin());

CREATE POLICY "Routes are viewable by everyone" ON routes FOR SELECT USING (true);
CREATE POLICY "Admins manage routes" ON routes FOR ALL USING (auth.is_admin());

CREATE POLICY "Seat layouts are viewable by everyone" ON seat_layouts FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage layouts" ON seat_layouts FOR ALL USING (auth.is_admin());

-- =====================================================
-- POLICIES: TRIPS
-- =====================================================
CREATE POLICY "Trips are viewable by everyone" ON trips 
    FOR SELECT USING (status != 'cancelled');

CREATE POLICY "Admins and Agents manage trips" ON trips 
    FOR ALL USING (
        auth.is_admin() OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'agent')
    );

-- =====================================================
-- POLICIES: BOOKINGS & BOOKING_SEATS
-- =====================================================
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id OR auth.is_admin());

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own booking seats" ON booking_seats
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND (user_id = auth.uid() OR auth.is_admin()))
    );

-- =====================================================
-- POLICIES: SEAT LOCKS (REAL-TIME CONCURRENCY)
-- =====================================================
CREATE POLICY "Seat locks are viewable by all" ON seat_locks FOR SELECT USING (true);
CREATE POLICY "Users can manage own locks" ON seat_locks
    FOR ALL USING (auth.uid() = user_id OR auth.is_admin());

-- =====================================================
-- POLICIES: STAFF & TRIP STAFF
-- =====================================================
CREATE POLICY "Staff directory viewable by admin" ON staff FOR ALL USING (auth.is_admin());
CREATE POLICY "Trip staff assignments viewable by admin" ON trip_staff FOR ALL USING (auth.is_admin());
CREATE POLICY "Staff can view their own assignments" ON trip_staff
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM staff WHERE id = staff_id AND user_id = auth.uid())
    );

-- =====================================================
-- POLICIES: PAYMENTS
-- =====================================================
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND (user_id = auth.uid() OR auth.is_admin()))
    );

-- =====================================================
-- ENABLE REALTIME FOR KEY TABLES
-- =====================================================
ALTER publication supabase_realtime ADD TABLE seat_locks;
ALTER publication supabase_realtime ADD TABLE trips;
ALTER publication supabase_realtime ADD TABLE bookings;
