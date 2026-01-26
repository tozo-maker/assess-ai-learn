-- Fix the student_performance view to use security_invoker
DROP VIEW IF EXISTS public.student_performance;

CREATE VIEW public.student_performance 
WITH (security_invoker = on)
AS
SELECT 
  s.id as student_id,
  s.teacher_id,
  s.first_name,
  s.last_name,
  COALESCE(AVG(sr.score::float), 0) as average_score,
  COUNT(DISTINCT sr.assessment_id) as assessment_count,
  CASE 
    WHEN AVG(sr.score::float) >= 80 THEN 'Proficient'
    WHEN AVG(sr.score::float) >= 60 THEN 'Developing'
    ELSE 'Needs Support'
  END as performance_level,
  CASE WHEN AVG(sr.score::float) < 60 THEN true ELSE false END as needs_attention
FROM public.students s
LEFT JOIN public.student_responses sr ON s.id = sr.student_id
GROUP BY s.id, s.teacher_id, s.first_name, s.last_name;