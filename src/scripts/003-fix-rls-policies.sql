-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Anyone can view trips" ON trips;
DROP POLICY IF EXISTS "Passengers can insert own trips" ON trips;
DROP POLICY IF EXISTS "Passengers can update own trips" ON trips;
DROP POLICY IF EXISTS "Drivers can update accepted trips" ON trips;

DROP POLICY IF EXISTS "Drivers can view confirmations" ON driver_confirmations;
DROP POLICY IF EXISTS "Drivers can insert confirmations" ON driver_confirmations;

-- Create better RLS policies for profiles
CREATE POLICY "Enable insert for authenticated users only" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for trips
CREATE POLICY "Enable read access for all authenticated users" ON trips
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for passengers only" ON trips
  FOR INSERT WITH CHECK (
    auth.uid() = passenger_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'passenger'
    )
  );

CREATE POLICY "Enable update for trip owners" ON trips
  FOR UPDATE USING (
    auth.uid() = passenger_id OR 
    (auth.uid() = driver_id AND status IN ('accepted', 'completed'))
  );

-- Create RLS policies for driver confirmations
CREATE POLICY "Enable read for trip participants" ON driver_confirmations
  FOR SELECT USING (
    auth.uid() = driver_id OR 
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = driver_confirmations.trip_id 
      AND trips.passenger_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for drivers only" ON driver_confirmations
  FOR INSERT WITH CHECK (
    auth.uid() = driver_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'driver'
    )
  );

-- Allow public read access to governorates and cities (no RLS needed)
ALTER TABLE governorates DISABLE ROW LEVEL SECURITY;
ALTER TABLE cities DISABLE ROW LEVEL SECURITY;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- This function will be called after a new user is created in auth.users
  -- It allows the user to insert their profile immediately after signup
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration (optional, for future use)
-- This ensures that when a user signs up, they can immediately create their profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
