-- Add a 'role' column to the profiles table
ALTER TABLE profiles
ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- You will need to manually update the role for specific users to 'admin'
-- For example:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your_admin_email@example.com';
