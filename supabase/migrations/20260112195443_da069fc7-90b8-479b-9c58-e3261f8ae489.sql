-- Fix RLS policies for leads table - restrict SELECT to service_role only
DROP POLICY IF EXISTS "Allow all inserts" ON public.leads;

-- Leads: Allow public INSERT (for lead capture forms) but no public SELECT
CREATE POLICY "Allow public lead submissions" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Leads: Only service_role can SELECT (for admin/backend access)
CREATE POLICY "Service role can read leads" 
ON public.leads 
FOR SELECT 
USING (auth.role() = 'service_role');

-- Verify payments table has proper restrictions
-- The payments table should only be accessible by service_role
DROP POLICY IF EXISTS "Service role can read payments" ON public.payments;
CREATE POLICY "Service role only can read payments" 
ON public.payments 
FOR SELECT 
USING (auth.role() = 'service_role');

-- Ensure no public INSERT on payments (only webhook should insert)
DROP POLICY IF EXISTS "Service role can insert payments" ON public.payments;
CREATE POLICY "Service role only can insert payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Service role can update payments
DROP POLICY IF EXISTS "Service role can update payments" ON public.payments;
CREATE POLICY "Service role only can update payments" 
ON public.payments 
FOR UPDATE 
USING (auth.role() = 'service_role');