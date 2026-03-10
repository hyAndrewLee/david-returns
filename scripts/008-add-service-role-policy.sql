-- Add policy to allow service role to read all profiles
-- This ensures the admin dashboard can fetch all customers

-- First drop existing policy if it exists
DROP POLICY IF EXISTS "Service role can read all profiles" ON profiles;

-- Create policy for service role to read all profiles
CREATE POLICY "Service role can read all profiles"
ON profiles
FOR SELECT
TO service_role
USING (true);

-- Also add policy for service role on addresses
DROP POLICY IF EXISTS "Service role can read all addresses" ON addresses;

CREATE POLICY "Service role can read all addresses"
ON addresses
FOR SELECT
TO service_role
USING (true);

-- Also add policy for service role on subscriptions
DROP POLICY IF EXISTS "Service role can read all subscriptions" ON subscriptions;

CREATE POLICY "Service role can read all subscriptions"
ON subscriptions
FOR SELECT
TO service_role
USING (true);
