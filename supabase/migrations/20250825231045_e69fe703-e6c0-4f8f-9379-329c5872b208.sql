-- Phase 1: Security and Database Hardening

-- Fix RLS policy for system_performance_logs to prevent data exposure
DROP POLICY IF EXISTS "Admin can view performance logs" ON public.system_performance_logs;

-- Create proper RLS policy that only allows users to see their own logs
CREATE POLICY "Users can view their own performance logs" 
ON public.system_performance_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow service role to insert logs (for edge function)
CREATE POLICY "Service can insert performance logs" 
ON public.system_performance_logs 
FOR INSERT 
WITH CHECK (true);

-- Add missing database indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON public.students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assessments_teacher_id ON public.assessments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_responses_student_id ON public.student_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_responses_assessment_id ON public.student_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_goals_teacher_id ON public.goals(teacher_id);
CREATE INDEX IF NOT EXISTS idx_goals_student_id ON public.goals(student_id);
CREATE INDEX IF NOT EXISTS idx_system_performance_logs_user_id ON public.system_performance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_performance_logs_created_at ON public.system_performance_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_performance_logs_endpoint ON public.system_performance_logs(endpoint);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_student_responses_student_assessment ON public.student_responses(student_id, assessment_id);
CREATE INDEX IF NOT EXISTS idx_goals_student_status ON public.goals(student_id, status);
CREATE INDEX IF NOT EXISTS idx_performance_logs_user_created ON public.system_performance_logs(user_id, created_at DESC);