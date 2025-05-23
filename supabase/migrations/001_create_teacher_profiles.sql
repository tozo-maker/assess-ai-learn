
-- Create teacher_profiles table to store additional teacher information
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  school TEXT,
  grade_levels TEXT[] DEFAULT '{}',
  subjects TEXT[] DEFAULT '{}',
  years_experience TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for teacher profiles (only if they don't exist)
DO $$ BEGIN
  CREATE POLICY "Teachers can view their own profile" 
    ON public.teacher_profiles 
    FOR SELECT 
    USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Teachers can update their own profile" 
    ON public.teacher_profiles 
    FOR UPDATE 
    USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Teachers can insert their own profile" 
    ON public.teacher_profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create function to handle new teacher registration
CREATE OR REPLACE FUNCTION public.handle_new_teacher()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.teacher_profiles (
    id, 
    full_name, 
    school, 
    grade_levels, 
    subjects, 
    years_experience
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'school', ''),
    CASE 
      WHEN new.raw_user_meta_data ? 'grade_levels' AND new.raw_user_meta_data ->> 'grade_levels' != ''
      THEN ARRAY(SELECT unnest(string_to_array(new.raw_user_meta_data ->> 'grade_levels', ',')))
      ELSE '{}'::text[]
    END,
    CASE 
      WHEN new.raw_user_meta_data ? 'subjects' AND new.raw_user_meta_data ->> 'subjects' != ''
      THEN ARRAY(SELECT unnest(string_to_array(new.raw_user_meta_data ->> 'subjects', ',')))
      ELSE '{}'::text[]
    END,
    new.raw_user_meta_data ->> 'years_experience'
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create teacher profile: %', SQLERRM;
    RETURN new;
END;
$$;

-- Create trigger to automatically create teacher profile on user registration
DROP TRIGGER IF EXISTS on_auth_teacher_created ON auth.users;
CREATE TRIGGER on_auth_teacher_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_teacher();

-- Add update trigger for teacher_profiles
CREATE TRIGGER update_teacher_profiles_updated_at
  BEFORE UPDATE ON public.teacher_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();
