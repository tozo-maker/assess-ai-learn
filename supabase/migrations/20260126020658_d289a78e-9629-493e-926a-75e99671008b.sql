-- Create teacher_profiles table
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  school TEXT,
  grade_levels TEXT[],
  subjects TEXT[],
  years_experience INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own profile" ON public.teacher_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Teachers can update their own profile" ON public.teacher_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Teachers can insert their own profile" ON public.teacher_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade_level TEXT,
  subject TEXT,
  academic_year TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own classes" ON public.classes
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their own classes" ON public.classes
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own classes" ON public.classes
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own classes" ON public.classes
  FOR DELETE USING (teacher_id = auth.uid());

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade_level TEXT,
  student_id TEXT,
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  special_considerations TEXT,
  learning_goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own students" ON public.students
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their own students" ON public.students
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own students" ON public.students
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own students" ON public.students
  FOR DELETE USING (teacher_id = auth.uid());

-- Create skills table (read-only for authenticated users)
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  grade_levels TEXT[],
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Skills are read-only for authenticated users (system data)
CREATE POLICY "Authenticated users can view skills" ON public.skills
  FOR SELECT TO authenticated USING (true);

-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  grade_level TEXT,
  assessment_type TEXT,
  max_score INTEGER DEFAULT 100,
  assessment_date DATE,
  standards_covered TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own assessments" ON public.assessments
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their own assessments" ON public.assessments
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own assessments" ON public.assessments
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own assessments" ON public.assessments
  FOR DELETE USING (teacher_id = auth.uid());

-- Create assessment_items table
CREATE TABLE IF NOT EXISTS public.assessment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  knowledge_type TEXT,
  difficulty_level TEXT,
  max_score INTEGER DEFAULT 1,
  item_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view assessment items" ON public.assessment_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assessments a 
      WHERE a.id = assessment_items.assessment_id AND a.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert assessment items" ON public.assessment_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments a 
      WHERE a.id = assessment_items.assessment_id AND a.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update assessment items" ON public.assessment_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.assessments a 
      WHERE a.id = assessment_items.assessment_id AND a.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete assessment items" ON public.assessment_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.assessments a 
      WHERE a.id = assessment_items.assessment_id AND a.teacher_id = auth.uid()
    )
  );

-- Create student_responses table
CREATE TABLE IF NOT EXISTS public.student_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  assessment_item_id UUID REFERENCES public.assessment_items(id) ON DELETE CASCADE,
  score NUMERIC DEFAULT 0,
  error_type TEXT,
  teacher_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their student responses" ON public.student_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_responses.student_id AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert student responses" ON public.student_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_responses.student_id AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update student responses" ON public.student_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_responses.student_id AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete student responses" ON public.student_responses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_responses.student_id AND s.teacher_id = auth.uid()
    )
  );

-- Create assessment_analysis table
CREATE TABLE IF NOT EXISTS public.assessment_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  strengths TEXT[],
  growth_areas TEXT[],
  patterns_observed TEXT[],
  recommendations TEXT[],
  overall_summary TEXT,
  analysis_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their assessment analysis" ON public.assessment_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = assessment_analysis.student_id AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert assessment analysis" ON public.assessment_analysis
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = assessment_analysis.student_id AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update assessment analysis" ON public.assessment_analysis
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = assessment_analysis.student_id AND s.teacher_id = auth.uid()
    )
  );

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their goals" ON public.goals
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their goals" ON public.goals
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their goals" ON public.goals
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their goals" ON public.goals
  FOR DELETE USING (teacher_id = auth.uid());

-- Create parent_communications table
CREATE TABLE IF NOT EXISTS public.parent_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  parent_email TEXT,
  communication_type TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  email_status TEXT DEFAULT 'draft',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.parent_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their communications" ON public.parent_communications
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their communications" ON public.parent_communications
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their communications" ON public.parent_communications
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their communications" ON public.parent_communications
  FOR DELETE USING (teacher_id = auth.uid());

-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  template_type TEXT DEFAULT 'custom',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their templates" ON public.email_templates
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their templates" ON public.email_templates
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their templates" ON public.email_templates
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their templates" ON public.email_templates
  FOR DELETE USING (teacher_id = auth.uid());

-- Create system_performance_logs table
CREATE TABLE IF NOT EXISTS public.system_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT,
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.system_performance_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own logs
CREATE POLICY "Users can view their own logs" ON public.system_performance_logs
  FOR SELECT USING (user_id = auth.uid());

-- No direct insert from clients (use edge function with service role)

-- Create student_performance view for aggregated data
CREATE OR REPLACE VIEW public.student_performance AS
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

-- Create secure get_teacher_profile function with authorization check
CREATE OR REPLACE FUNCTION public.get_teacher_profile(p_user_id UUID)
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
SET search_path = ''
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
  WHERE tp.id = p_user_id 
    AND tp.id = auth.uid(); -- Authorization check: only own profile
$$;

GRANT EXECUTE ON FUNCTION public.get_teacher_profile(UUID) TO authenticated;

-- Create function to handle new teacher profile creation
CREATE OR REPLACE FUNCTION public.handle_new_teacher()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.teacher_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_teacher();

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at columns
CREATE TRIGGER update_teacher_profiles_updated_at
  BEFORE UPDATE ON public.teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessment_analysis_updated_at
  BEFORE UPDATE ON public.assessment_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON public.students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_assessments_teacher_id ON public.assessments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_responses_student_id ON public.student_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_responses_assessment_id ON public.student_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_goals_student_id ON public.goals(student_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_parent_communications_teacher_id ON public.parent_communications(teacher_id);
CREATE INDEX IF NOT EXISTS idx_system_performance_logs_user_id ON public.system_performance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_performance_logs_created_at ON public.system_performance_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);