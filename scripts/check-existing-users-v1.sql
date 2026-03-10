-- Check all existing users in your app
SELECT 
  auth.users.id,
  auth.users.email,
  auth.users.created_at,
  profiles.is_admin
FROM auth.users
LEFT JOIN profiles ON auth.users.id = profiles.id
ORDER BY auth.users.created_at DESC;
