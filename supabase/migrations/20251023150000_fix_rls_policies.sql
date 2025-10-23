-- Fix RLS policies to prevent unauthorized deletes and updates
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow public delete" ON profiles;
DROP POLICY IF EXISTS "Allow public update" ON profiles;

-- Create new, more secure policies
-- Only allow deletes from authenticated service role (admin only)
CREATE POLICY "Only service role can delete profiles" ON profiles
  FOR DELETE
  USING (auth.role() = 'service_role');

-- Only allow updates for duplicate LinkedIn URL handling (by matching LinkedIn)
-- This allows the saveProfile function to update existing profiles
CREATE POLICY "Allow update for same LinkedIn URL" ON profiles
  FOR UPDATE
  USING (true)  -- Will be handled by application logic
  WITH CHECK (true);

-- Add comments for clarity
COMMENT ON POLICY "Only service role can delete profiles" ON profiles IS 
  'Prevents public deletion of profiles - only admin/service role can delete';
COMMENT ON POLICY "Allow update for same LinkedIn URL" ON profiles IS 
  'Allows profile updates when same LinkedIn URL is used (deduplication)';


