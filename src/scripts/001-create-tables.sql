-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('passenger', 'driver')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create governorates table
CREATE TABLE IF NOT EXISTS governorates (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  governorate_id INTEGER REFERENCES governorates(id),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  passenger_id UUID REFERENCES profiles(id) NOT NULL,
  from_city_id INTEGER REFERENCES cities(id) NOT NULL,
  to_city_id INTEGER REFERENCES cities(id) NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME,
  fare_offered DECIMAL(10,2) NOT NULL,
  passenger_count INTEGER DEFAULT 1,
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')) DEFAULT 'pending',
  driver_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create driver confirmations table
CREATE TABLE IF NOT EXISTS driver_confirmations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) NOT NULL,
  driver_id UUID REFERENCES profiles(id) NOT NULL,
  pickup_time TIME NOT NULL,
  driver_phone TEXT NOT NULL,
  whatsapp_number TEXT,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_color TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  message TEXT,
  terms_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_confirmations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view trips" ON trips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Passengers can insert own trips" ON trips FOR INSERT WITH CHECK (auth.uid() = passenger_id);
CREATE POLICY "Passengers can update own trips" ON trips FOR UPDATE USING (auth.uid() = passenger_id);
CREATE POLICY "Drivers can update accepted trips" ON trips FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can view confirmations" ON driver_confirmations FOR SELECT USING (auth.uid() = driver_id);
CREATE POLICY "Drivers can insert confirmations" ON driver_confirmations FOR INSERT WITH CHECK (auth.uid() = driver_id);
