-- Test RLS policies
-- This script helps verify that the RLS policies are working correctly

-- Test 1: Check if governorates and cities are publicly readable
SELECT COUNT(*) as governorate_count FROM governorates;
SELECT COUNT(*) as city_count FROM cities;

-- Test 2: Verify RLS is enabled on the right tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'trips', 'driver_confirmations');

-- Test 3: List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Note: The actual user insertion test will happen when users register through the app
