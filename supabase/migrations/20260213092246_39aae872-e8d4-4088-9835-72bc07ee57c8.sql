
-- Rename mercadopago_id to flow_order to support Flow payment gateway
-- First make mercadopago_id nullable since we're transitioning
ALTER TABLE public.payments ALTER COLUMN mercadopago_id DROP NOT NULL;

-- Add flow_order column
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS flow_order text;

-- Copy existing data (if any)
UPDATE public.payments SET flow_order = mercadopago_id WHERE flow_order IS NULL AND mercadopago_id IS NOT NULL;

-- Add flow_token column for Flow's token-based verification
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS flow_token text;
