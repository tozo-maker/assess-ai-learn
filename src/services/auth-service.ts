
import { supabase } from '@/integrations/supabase/client';
import { TeacherProfile } from '@/types/auth';

export const authService = {
  async signUp(data: any) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          school: data.school,
          grade_levels: data.gradeLevels?.join(',') || '',
          subjects: data.subjects?.join(',') || '',
          years_experience: data.yearsExperience || null
        }
      }
    });

    if (error) throw error;
    return authData;
  },

  async signIn(data: any) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (error) throw error;
    return authData;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getProfile(): Promise<TeacherProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProfile(updates: Partial<TeacherProfile>): Promise<TeacherProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('teacher_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    if (error) throw error;
  }
};
