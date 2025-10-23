-- Enable pg_trgm extension for trigram indexes (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add generated column that flattens core_skills array into searchable text
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS core_skills_text TEXT GENERATED ALWAYS AS (array_to_string(core_skills, ' ')) STORED;

-- Trigram index for fast ILIKE substring search on skills text
CREATE INDEX IF NOT EXISTS idx_profiles_core_skills_text_trgm
  ON profiles USING GIN (core_skills_text gin_trgm_ops);
