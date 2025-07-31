-- Insert default platform settings if they don't already exist
INSERT INTO platform_settings (key, value, description) VALUES
('default_driver_approval', 'true', 'Automatically approve new driver registrations'),
('min_fare_tnd', '5.0', 'Minimum fare allowed for a trip in TND'),
('max_passengers_per_trip', '4', 'Maximum number of passengers allowed per trip'),
('contact_email', 'support@tunisride.com', 'Official contact email for the platform')
ON CONFLICT (key) DO NOTHING; -- Do nothing if the key already exists
