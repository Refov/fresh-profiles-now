-- Create a function to search profiles with substring matching in skills array
-- This allows searching for "ats" to match "workable ats", "team tailor ats", etc.
CREATE OR REPLACE FUNCTION search_profiles_by_skills(
  skill_terms TEXT[]
)
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.expires_at > NOW()
    AND (
      -- Check if ALL search terms exist as substrings in ANY skill
      SELECT bool_and(
        EXISTS (
          SELECT 1
          FROM unnest(p.core_skills) AS skill
          WHERE skill ILIKE '%' || term || '%'
        )
      )
      FROM unnest(skill_terms) AS term
    );
END;
$$ LANGUAGE plpgsql STABLE;

