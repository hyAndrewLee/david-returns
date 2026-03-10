-- Update your user to be an admin
-- Replace 'your-email@example.com' with your actual email

UPDATE profiles 
SET is_admin = true 
WHERE email = 'davidqiu202@gmail.com';

-- Verify it worked
SELECT id, email, full_name, is_admin 
FROM profiles 
WHERE is_admin = true;
