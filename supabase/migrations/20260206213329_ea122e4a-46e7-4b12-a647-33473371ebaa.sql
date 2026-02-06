-- Create patient_assessments table to store questionnaire results
CREATE TABLE public.patient_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Patient info
  patient_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Questionnaire data
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  irp_score NUMERIC,
  risk_level TEXT, -- 'low', 'moderate', 'high', 'very-high'
  
  -- Treatment info
  missing_teeth_count INTEGER,
  treatment_type TEXT, -- 'single', 'multiple', 'full-arch'
  
  -- Purchase tracking
  purchase_level TEXT DEFAULT 'free', -- 'free', 'plan-accion', 'premium'
  payment_id UUID REFERENCES public.payments(id),
  
  -- Session tracking
  session_id TEXT,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.patient_assessments ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for questionnaire submissions)
CREATE POLICY "Anyone can submit assessments"
ON public.patient_assessments
FOR INSERT
WITH CHECK (true);

-- Service role can do everything
CREATE POLICY "Service role full access on assessments"
ON public.patient_assessments
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add trigger for updated_at
CREATE TRIGGER update_patient_assessments_updated_at
BEFORE UPDATE ON public.patient_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for email lookups
CREATE INDEX idx_patient_assessments_email ON public.patient_assessments(email);

-- Create index for session lookups
CREATE INDEX idx_patient_assessments_session ON public.patient_assessments(session_id);