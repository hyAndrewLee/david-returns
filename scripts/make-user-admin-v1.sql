-- Make an existing user an admin
-- Replace 'davidqiu202@gmail.com' with your actual email

UPDATE profiles 
SET is_admin = true 
WHERE email = 'davidqiu202@gmail.com';

-- Verify it worked
SELECT id, email, is_admin, full_name 
FROM profiles 
WHERE is_admin = true;
