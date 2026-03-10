-- Fix infinite recursion in profiles RLS policies
-- The issue: policies checking is_admin create loops when querying profiles table

-- Drop all existing profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can read all profiles" ON profiles;

-- Create simple, non-recursive policies
-- Users can always read their own profile (no is_admin check needed)
CREATE POLICY "Users can select own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Service role bypass (used by admin client)
CREATE POLICY "Service role full access to profiles"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- IMPORTANT: Admin access is handled through service_role client in code
-- NOT through RLS policies that would create recursion
