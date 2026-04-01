-- =====================================================
-- SEED DATA: BUSES, ROUTES, TRIPS & LAYOUTS (PRODUCTION READY)
-- =====================================================

-- 1. Insert Buses (Modern Fleet)
INSERT INTO public.buses (name, registration_number, bus_type, total_seats, amenities, is_active)
VALUES 
    ('Scania Premium AC', 'WB-01-A-1234', 'AC Sleeper', 40, ARRAY['AC', 'WiFi', 'Charging', 'Blanket'], true),
    ('Volvo Multiaxle B11R', 'WB-01-B-5678', 'AC Seater', 55, ARRAY['AC', 'WiFi', 'Charging', 'Entertainment'], true),
    ('BharatBenz Euro 6', 'WB-01-C-9012', 'Non-AC Seater', 50, ARRAY['Pushback Chairs', 'Water'], true),
    ('Mercedes-Benz SHD', 'WB-02-D-3456', 'AC Sleeper Lux', 36, ARRAY['AC', 'WiFi', 'Charging', 'Individual TV'], true)
ON CONFLICT (registration_number) DO UPDATE SET is_active = true;


-- 2. Insert Popular Routes
INSERT INTO public.routes (origin, destination, distance_km, estimated_duration_minutes, is_active)
VALUES 
    ('Kolkata', 'Siliguri', 580, 720, true),
    ('Kolkata', 'Digha', 180, 240, true),
    ('Kolkata', 'Darjeeling', 620, 840, true),
    ('Siliguri', 'Kolkata', 580, 720, true),
    ('Kolkata', 'Mandarmani', 170, 210, true)
ON CONFLICT (origin, destination) DO NOTHING;

-- 3. Insert Base Seat Layout Templates
INSERT INTO public.seat_layouts (name, layout_data, is_template, is_active)
VALUES 
    ('40 Seat Sleeper (2x1)', '{"rows":10,"cols":3,"seats":[]}'::jsonb, true, true),
    ('55 Seat Seater (2x2)', '{"rows":14,"cols":4,"seats":[]}'::jsonb, true, true)
ON CONFLICT DO NOTHING;

-- 4. Create Trips for the Fleet (Future Dated)
-- Note: departure_time uses relative NOW() + intervals
INSERT INTO public.trips (route_id, bus_id, departure_time, arrival_time, base_price, total_seats, available_seats, status)
SELECT 
    r.id, 
    b.id,
    NOW() + (INTERVAL '1 day' * (FLOOR(RANDOM() * 5) + 1)),
    NOW() + (INTERVAL '1 day' * (FLOOR(RANDOM() * 5) + 1)) + (INTERVAL '1 minute' * r.estimated_duration_minutes),
    (CASE WHEN b.bus_type LIKE '%AC%' THEN 1200 ELSE 600 END),
    b.total_seats,
    b.total_seats,
    'scheduled'::trip_status
FROM public.routes r
CROSS JOIN public.buses b
LIMIT 20
ON CONFLICT DO NOTHING;

-- 5. Add Coupons/Offers
INSERT INTO public.coupons (code, description, discount_type, discount_value, valid_from, valid_until, usage_limit, is_active)
VALUES 
    ('FIRST50', 'First Ride Special', 'percentage', 50, NOW(), NOW() + INTERVAL '1 year', 1000, true),
    ('WELCOME', 'Welcome Discount', 'fixed', 200, NOW(), NOW() + INTERVAL '6 months', 500, true),
    ('VOYATRA20', 'Seasonal Offer', 'percentage', 20, NOW(), NOW() + INTERVAL '3 months', 2000, true)
ON CONFLICT (code) DO UPDATE SET is_active = true;
