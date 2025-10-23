-- One-time migration to normalize existing core_skills data
-- This splits comma-separated skills, trims, lowercases, and deduplicates

DO 
DECLARE
  profile_record RECORD;
  normalized_skills TEXT[];
  skill TEXT;
  skill_parts TEXT[];
  part TEXT;
BEGIN
  FOR profile_record IN SELECT id, core_skills FROM profiles LOOP
    normalized_skills := ARRAY[]::TEXT[];
    
    FOREACH skill IN ARRAY profile_record.core_skills LOOP
      -- Split by comma
      skill_parts := string_to_array(skill, ',');
      
      FOREACH part IN ARRAY skill_parts LOOP
        part := lower(trim(part));
        
        -- Only add if non-empty and not already in array
        IF part <> '' AND NOT (part = ANY(normalized_skills)) THEN
          normalized_skills := array_append(normalized_skills, part);
        END IF;
      END LOOP;
    END LOOP;
    
    -- Update the profile with normalized skills
    UPDATE profiles
    SET core_skills = normalized_skills
    WHERE id = profile_record.id;
  END LOOP;
END ;
