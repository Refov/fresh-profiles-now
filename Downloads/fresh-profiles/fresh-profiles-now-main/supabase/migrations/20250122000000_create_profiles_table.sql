-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  job_title TEXT NOT NULL,
  work_modes TEXT[] NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  about_me TEXT NOT NULL,
  linkedin_url TEXT NOT NULL UNIQUE,
  core_skills TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_work_modes ON profiles USING GIN (work_modes);
CREATE INDEX IF NOT EXISTS idx_profiles_core_skills ON profiles USING GIN (core_skills);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles (city);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles (country);
CREATE INDEX IF NOT EXISTS idx_profiles_expires_at ON profiles (expires_at);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read profiles
CREATE POLICY "Allow public read access" ON profiles
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert profiles
CREATE POLICY "Allow public insert" ON profiles
  FOR INSERT WITH CHECK (true);

-- Create policy to allow anyone to update profiles (for deduplication)
CREATE POLICY "Allow public update" ON profiles
  FOR UPDATE USING (true);

-- Create policy to allow anyone to delete profiles
CREATE POLICY "Allow public delete" ON profiles
  FOR DELETE USING (true);
