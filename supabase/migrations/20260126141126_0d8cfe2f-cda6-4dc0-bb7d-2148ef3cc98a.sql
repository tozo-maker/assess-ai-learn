-- Drop permissive write policies on skills table
-- Skills should be read-only reference data, only modifiable via service role
DROP POLICY IF EXISTS "Teachers can insert skills" ON public.skills;
DROP POLICY IF EXISTS "Teachers can update skills" ON public.skills;
DROP POLICY IF EXISTS "Teachers can delete skills" ON public.skills;

-- Ensure only the read-only policy remains active
-- The "Authenticated users can view skills" policy already exists and is correct