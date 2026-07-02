GRANT INSERT ON public.leads TO anon;
GRANT INSERT, SELECT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

-- Recreate policy to ensure it explicitly targets anon and authenticated
DROP POLICY IF EXISTS "Allow public lead submissions" ON public.leads;
CREATE POLICY "Allow public lead submissions"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);