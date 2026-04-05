-- Ensure routes remain readable for booking history even when deactivated.
-- (Search and public listing should be filtered at the query layer.)

ALTER TABLE IF EXISTS public.routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view routes" ON public.routes;
DROP POLICY IF EXISTS "Anyone can view active routes" ON public.routes;

CREATE POLICY "Anyone can view routes"
  ON public.routes
  FOR SELECT
  USING (true);

