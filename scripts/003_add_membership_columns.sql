-- Add membership tracking columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Update subscriptions table to ensure all necessary fields exist
ALTER TABLE subscriptions
ALTER COLUMN status SET DEFAULT 'inactive';

-- Add index for faster membership lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
ON subscriptions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_profiles_subscription 
ON profiles(stripe_subscription_id);
