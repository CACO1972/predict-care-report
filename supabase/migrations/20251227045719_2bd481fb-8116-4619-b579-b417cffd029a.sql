-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  patient_name TEXT,
  source TEXT DEFAULT 'questionnaire',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (no auth required for lead capture)
CREATE POLICY "Anyone can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view leads (for now, no admin system)
-- We'll create a service role policy for backend access
CREATE POLICY "Service role can view all leads"
ON public.leads
FOR SELECT
USING (auth.role() = 'service_role');