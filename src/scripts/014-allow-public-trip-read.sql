-- Drop the existing policy that restricts trip selection to authenticated users
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON trips;

-- Create a new policy to allow SELECT access for all users (public and authenticated)
CREATE POLICY "Allow public read access to trips" ON trips
  FOR SELECT
  USING (true); -- 'true' means anyone can read

-- Ensure the authenticated role still has SELECT permissions (though 'true' covers it)
GRANT SELECT ON trips TO authenticated;
GRANT SELECT ON trips TO public;
