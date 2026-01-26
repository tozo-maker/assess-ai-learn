-- Add missing DELETE policy for assessment_analysis table
-- This allows teachers to delete AI analysis records for their own students

CREATE POLICY "Teachers can delete their assessment analysis" 
ON public.assessment_analysis
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = assessment_analysis.student_id 
      AND s.teacher_id = auth.uid()
  )
);