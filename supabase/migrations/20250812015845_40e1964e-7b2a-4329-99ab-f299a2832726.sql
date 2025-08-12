-- Fix linter warnings: set immutable function search_path
-- calculate_mastery_level
CREATE OR REPLACE FUNCTION public.calculate_mastery_level(score numeric)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path TO ''
AS $$
BEGIN
  IF score >= 90 THEN
    RETURN 'Advanced';
  ELSIF score >= 80 THEN
    RETURN 'Proficient';
  ELSIF score >= 65 THEN
    RETURN 'Developing';
  ELSE
    RETURN 'Beginning';
  END IF;
END;
$$;

-- update_modified_column
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- update_student_skill_mastery
CREATE OR REPLACE FUNCTION public.update_student_skill_mastery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  avg_score NUMERIC;
  new_mastery_level TEXT;
  assessment_count_val INTEGER;
BEGIN
  SELECT 
    AVG(score),
    COUNT(*)
  INTO avg_score, assessment_count_val
  FROM (
    SELECT score 
    FROM public.skill_mastery_history 
    WHERE student_id = NEW.student_id 
      AND skill_id = NEW.skill_id
    ORDER BY date_recorded DESC
    LIMIT 5
  ) recent_scores;
  
  new_mastery_level := public.calculate_mastery_level(avg_score);
  
  INSERT INTO public.student_skills (
    student_id, 
    skill_id, 
    current_mastery_level, 
    mastery_score, 
    assessment_count,
    last_assessed_at
  ) VALUES (
    NEW.student_id,
    NEW.skill_id,
    new_mastery_level,
    avg_score,
    assessment_count_val,
    NEW.date_recorded
  )
  ON CONFLICT (student_id, skill_id) 
  DO UPDATE SET
    current_mastery_level = new_mastery_level,
    mastery_score = avg_score,
    assessment_count = assessment_count_val,
    last_assessed_at = NEW.date_recorded,
    updated_at = now();
    
  RETURN NEW;
END;
$$;

-- Note: Other warnings (OTP expiry, leaked password protection) require Auth settings changes in the dashboard.