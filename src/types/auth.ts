
export interface TeacherProfile {
  id: string;
  full_name: string;
  school?: string;
  grade_levels?: string[];
  subjects?: string[];
  years_experience?: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: TeacherProfile;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  school: string;
  grade_levels: string[];
  subjects: string[];
  years_experience?: number;
}
