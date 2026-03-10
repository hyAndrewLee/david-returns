-- Add tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS return_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS proof_pickup_url TEXT,
ADD COLUMN IF NOT EXISTS proof_delivery_url TEXT,
ADD COLUMN IF NOT EXISTS proof_return_url TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- tracking_status values: pending, picked_up, in_transit, delivered, return_confirmed, cancelled

-- Add RLS policy for service role to manage all orders (admin access)
CREATE POLICY "Service role can manage all orders" 
ON public.orders 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Create storage bucket for proof images (run this in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', true);
