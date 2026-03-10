-- Ensure profiles table has proper RLS policies for admin checking
-- This allows users to read their own profile (including is_admin field)

-- Check if policy already exists and drop if needed
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create policy allowing users to view their own profile data
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';
