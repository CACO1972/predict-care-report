-- Drop the insecure public SELECT policy
DROP POLICY IF EXISTS "Anyone can check payment status" ON public.payments;

-- Create a new restricted SELECT policy for service role only
CREATE POLICY "Service role can read payments" 
ON public.payments 
FOR SELECT 
USING (auth.role() = 'service_role');