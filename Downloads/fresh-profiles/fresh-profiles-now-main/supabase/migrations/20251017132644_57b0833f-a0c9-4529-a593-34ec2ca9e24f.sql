-- Create profiles table for job seekers
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  job_title TEXT NOT NULL,
  work_mode TEXT NOT NULL CHECK (work_mode IN ('onsite_hybrid', 'remote')),
  city TEXT,
  country TEXT NOT NULL,
  about_me TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  core_skills TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create index for filtering and sorting
CREATE INDEX idx_profiles_expires_at ON public.profiles(expires_at);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_profiles_country ON public.profiles(country);
CREATE INDEX idx_profiles_job_title ON public.profiles(job_title);

-- Create rate limiting table
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  post_count INT NOT NULL DEFAULT 0,
  reveal_count INT NOT NULL DEFAULT 0,
  last_post_at TIMESTAMPTZ,
  last_reveal_at TIMESTAMPTZ,
  reset_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 day')
);

CREATE INDEX idx_rate_limits_ip ON public.rate_limits(ip_address);
CREATE INDEX idx_rate_limits_reset ON public.rate_limits(reset_at);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (public access for this use case)
CREATE POLICY "Anyone can view active profiles"
  ON public.profiles
  FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Anyone can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for rate_limits (public access for checking limits)
CREATE POLICY "Anyone can view their rate limits"
  ON public.rate_limits
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert rate limits"
  ON public.rate_limits
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rate limits"
  ON public.rate_limits
  FOR UPDATE
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();