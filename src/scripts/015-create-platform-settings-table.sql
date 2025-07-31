-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for platform_settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow only admins to select, insert, update, and delete platform settings
CREATE POLICY "Admins can manage platform settings" ON platform_settings
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Grant necessary permissions to authenticated role (for admin access)
GRANT SELECT, INSERT, UPDATE, DELETE ON platform_settings TO authenticated;
