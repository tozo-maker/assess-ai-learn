
import { User, Session } from '@supabase/supabase-js';

export interface TeacherProfile {
  id: string;
  full_name: string;
  email: string;
  school: string;
  grade_levels: string[];
  subjects: string[];
  years_experience?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: TeacherProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  school: string;
  grade_levels: string[];
  subjects: string[];
  years_experience?: string;
}

export interface SignInData {
  email: string;
  password: string;
  remember?: boolean;
}
