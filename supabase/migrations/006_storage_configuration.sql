-- =====================================================
-- STORAGE CONFIGURATION
-- =====================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('bus-images', 'bus-images', true),
  ('qr-codes', 'qr-codes', true),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Bus images bucket policies
CREATE POLICY "Anyone can view bus images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bus-images');

CREATE POLICY "Admin can upload bus images"
  ON storage.objects FOR INSERT
  USING (bucket_id = 'bus-images' AND auth.is_admin());

CREATE POLICY "Admin can update bus images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'bus-images' AND auth.is_admin());

CREATE POLICY "Admin can delete bus images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'bus-images' AND auth.is_admin());

-- QR codes bucket policies
CREATE POLICY "Anyone can view QR codes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'qr-codes');

CREATE POLICY "System can upload QR codes"
  ON storage.objects FOR INSERT
  USING (bucket_id = 'qr-codes' AND auth.role() = 'service_role');

CREATE POLICY "System can update QR codes"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'qr-codes' AND auth.role() = 'service_role');

-- Documents bucket policies
CREATE POLICY "Admin can manage documents"
  ON storage.objects FOR ALL
  USING (bucket_id = 'documents' AND auth.is_admin());