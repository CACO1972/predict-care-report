-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create payments table to track MercadoPago transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  mercadopago_id TEXT NOT NULL UNIQUE,
  external_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  status_detail TEXT,
  payment_type TEXT,
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'CLP',
  payer_email TEXT,
  payer_name TEXT,
  purchase_level TEXT NOT NULL CHECK (purchase_level IN ('plan-accion', 'premium')),
  verified_at TIMESTAMP WITH TIME ZONE,
  raw_data JSONB
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for webhook)
CREATE POLICY "Service role full access" 
ON public.payments 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy: Anyone can check payment status by external_reference
CREATE POLICY "Anyone can check payment status" 
ON public.payments 
FOR SELECT 
USING (true);

-- Create indexes for faster lookups
CREATE INDEX idx_payments_external_reference ON public.payments(external_reference);
CREATE INDEX idx_payments_mercadopago_id ON public.payments(mercadopago_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();