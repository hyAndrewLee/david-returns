-- Debug: Check if profile exists and has admin flag
-- This will show us what's in the database for your user

SELECT 
  p.id,
  p.email,
  p.full_name,
  p.is_admin,
  p.created_at,
  a.email as auth_email
FROM profiles p
LEFT JOIN auth.users a ON a.id = p.id
WHERE p.email = 'davidqiu202@gmail.com' OR a.email = 'davidqiu202@gmail.com';

-- Also check if there's a mismatch between auth.users and profiles
SELECT 
  'Auth users' as source,
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'davidqiu202@gmail.com'

UNION ALL

SELECT 
  'Profiles' as source,
  id,
  email,
  created_at
FROM profiles
WHERE email = 'davidqiu202@gmail.com';
