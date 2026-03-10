-- Restore admin access for davidqiu202@gmail.com
-- This script will set the is_admin flag to true for your account

-- If your auth user still exists but profile was deleted, this recreates it with admin access
INSERT INTO profiles (id, email, is_admin, created_at, updated_at)
SELECT 
  id, 
  email, 
  true as is_admin,
  now() as created_at,
  now() as updated_at
FROM auth.users
WHERE email = 'davidqiu202@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  updated_at = now();

-- Verify the admin status
SELECT id, email, is_admin, created_at 
FROM profiles 
WHERE email = 'davidqiu202@gmail.com';
