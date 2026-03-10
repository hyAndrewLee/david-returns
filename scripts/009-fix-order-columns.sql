-- Fix order column names to match the code
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS total_amount INTEGER,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Copy data from old columns to new columns if they exist
UPDATE public.orders 
SET total_amount = amount_paid 
WHERE total_amount IS NULL AND amount_paid IS NOT NULL;

UPDATE public.orders 
SET stripe_payment_intent_id = stripe_payment_id 
WHERE stripe_payment_intent_id IS NULL AND stripe_payment_id IS NOT NULL;

-- We'll keep the old columns for backwards compatibility
-- but the code will now use the new column names
