-- Add amenities and status to buses to match UI/API payloads
ALTER TABLE buses
    ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';


-- Ensure created_at exists
ALTER TABLE buses
    ALTER COLUMN created_at SET DEFAULT NOW();
