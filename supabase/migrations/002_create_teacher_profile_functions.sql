
-- Create function to get teacher profile
CREATE OR REPLACE FUNCTION public.get_teacher_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  school TEXT,
  grade_levels TEXT[],
  subjects TEXT[],
  years_experience INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    tp.id,
    tp.full_name,
    tp.school,
    tp.grade_levels,
    tp.subjects,
    tp.years_experience,
    tp.avatar_url,
    tp.created_at,
    tp.updated_at
  FROM public.teacher_profiles tp
  WHERE tp.id = user_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_teacher_profile(UUID) TO authenticated;
