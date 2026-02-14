-- Remove redundant individual policies on payments table (the ALL policy already covers them)
DROP POLICY IF EXISTS "Service role only can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Service role only can read payments" ON public.payments;
DROP POLICY IF EXISTS "Service role only can update payments" ON public.payments;

-- The remaining "Service role full access" ALL policy covers INSERT, SELECT, UPDATE, DELETE