
-- Add RLS policies to allow authenticated users to manage skills
-- This will enable the seeding service to populate the skills database

-- Allow authenticated users to insert skills
CREATE POLICY "Teachers can insert skills" ON public.skills
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update skills  
CREATE POLICY "Teachers can update skills" ON public.skills
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete skills
CREATE POLICY "Teachers can delete skills" ON public.skills
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() IS NOT NULL);
