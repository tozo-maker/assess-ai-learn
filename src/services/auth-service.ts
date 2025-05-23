
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
          grade_levels: profileData.grade_levels.join(','),
          subjects: profileData.subjects.join(','),
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
    
    try {
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_teacher_profile', {
        user_id: user.user.id
      });
      
      if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        return rpcData[0] as TeacherProfile;
      }
      
      // Fallback to direct query
      const { data: directData, error: directError } = await supabase
        .from('teacher_profiles' as any)
        .select('*')
        .eq('id', user.user.id)
        .single();
      
      if (directError) {
        console.error('Error fetching teacher profile:', directError);
        return null;
      }
      
      return directData as TeacherProfile;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      return null;
    }
  },

  async updateProfile(profile: Partial<TeacherProfile>): Promise<TeacherProfile> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) throw new Error('No authenticated user');
    
    try {
      const { data, error } = await supabase
        .from('teacher_profiles' as any)
        .update(profile)
        .eq('id', user.user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as TeacherProfile;
    } catch (error) {
      console.error('Error updating teacher profile:', error);
      throw error;
    }
  },

  async createProfile(profile: Omit<TeacherProfile, 'id' | 'created_at' | 'updated_at'>): Promise<TeacherProfile> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) throw new Error('No authenticated user');
    
    try {
      const { data, error } = await supabase
        .from('teacher_profiles' as any)
        .insert({
          id: user.user.id,
          ...profile
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as TeacherProfile;
    } catch (error) {
      console.error('Error creating teacher profile:', error);
      throw error;
    }
  }
};
