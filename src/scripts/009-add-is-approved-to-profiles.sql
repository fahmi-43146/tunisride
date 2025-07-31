-- Add is_approved column to profiles table, defaulting to FALSE
ALTER TABLE profiles
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;

-- Note: Existing RLS policies on profiles should still work as they allow users to update their own profile.
-- Admin actions will bypass RLS using the service role key.
