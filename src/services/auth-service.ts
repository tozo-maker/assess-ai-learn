
import { supabase } from '@/integrations/supabase/client';
import { SignInData, SignUpData, TeacherProfile } from '@/types/auth';

export const authService = {
  async signUp(data: SignUpData) {
    const { email, password, ...profileData } = data;
    
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: profileData.full_name,
          school: profileData.school,
          grade_levels: profileData.grade_levels,
          subjects: profileData.subjects,
          years_experience: profileData.years_experience
        }
      }
    });

    if (error) throw error;
    return authData;
  },

  async signIn(data: SignInData) {
    const { email, password } = data;
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return authData;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getProfile(): Promise<TeacherProfile | null> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) return null;
    
    // Use a type assertion to tell TypeScript this is OK
    const { data, error } = await supabase
      .from('teacher_profiles' as any)
      .select('*')
      .eq('id', user.user.id)
      .single();
    
    if (error) throw error;
    return data as TeacherProfile;
  },

  async updateProfile(profile: Partial<TeacherProfile>): Promise<TeacherProfile> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) throw new Error('No authenticated user');
    
    // Use a type assertion to tell TypeScript this is OK
    const { data, error } = await supabase
      .from('teacher_profiles' as any)
      .update(profile)
      .eq('id', user.user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data as TeacherProfile;
  }
};
