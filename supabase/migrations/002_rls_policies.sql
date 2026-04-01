-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- HELPER FUNCTION: CHECK IF USER IS ADMIN
-- =====================================================
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
-- PROFILES POLICIES
-- =====================================================
-- Anyone can read profiles (for display)
CREATE POLICY "Anyone can view profiles"
    ON profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Admin can do anything
CREATE POLICY "Admin can manage all profiles"
    ON profiles FOR ALL
    USING (auth.is_admin());

-- =====================================================
-- BUSES POLICIES
-- =====================================================
-- Everyone can view active buses
CREATE POLICY "Anyone can view active buses"
    ON buses FOR SELECT
    USING (is_active = true);

-- Admin can manage all buses
CREATE POLICY "Admin can manage buses"
    ON buses FOR ALL
    USING (auth.is_admin());

-- =====================================================
-- SEAT LAYOUTS POLICIES
-- =====================================================
-- Anyone can view layouts (for seat selection)
CREATE POLICY "Anyone can view seat layouts"
    ON seat_layouts FOR SELECT
    USING (is_active = true);

-- Admin can manage layouts
CREATE POLICY "Admin can manage seat layouts"
    ON seat_layouts FOR ALL
    USING (auth.is_admin());

-- =====================================================
-- TRIPS POLICIES
-- =====================================================
-- Anyone can view upcoming trips
CREATE POLICY "Anyone can view trips"
    ON trips FOR SELECT
    USING (status != 'cancelled');

-- Admin and agents can manage trips
CREATE POLICY "Staff can manage trips"
    ON trips FOR ALL
    USING (
        auth.is_admin() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'agent')
        )
    );

-- =====================================================
-- BOOKINGS POLICIES
-- =====================================================
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending bookings
CREATE POLICY "Users can update own pending bookings"
    ON bookings FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- Admin can view all bookings
CREATE POLICY "Admin can view all bookings"
    ON bookings FOR SELECT
    USING (auth.is_admin());

-- Admin can manage all bookings
CREATE POLICY "Admin can manage all bookings"
    ON bookings FOR ALL
    USING (auth.is_admin());

-- =====================================================
-- SEAT LOCKS POLICIES
-- =====================================================
-- Anyone can view locks (for real-time display)
CREATE POLICY "Anyone can view seat locks"
    ON seat_locks FOR SELECT
    USING (true);

-- Users can create locks for their session
CREATE POLICY "Users can create locks"
    ON seat_locks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own locks
CREATE POLICY "Users can delete own locks"
    ON seat_locks FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);
