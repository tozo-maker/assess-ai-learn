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
      // Use maybeSingle() to handle cases where no profile exists
      const { data: profile, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', user.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching teacher profile from database:', error);
        return null;
      }

      // If no profile exists, try to create one from user metadata
      if (!profile && user.user.user_metadata) {
        console.log('No profile found, attempting to create from user metadata...');
        const metadata = user.user.user_metadata;
        
        try {
          const newProfile = await this.createProfile({
            full_name: metadata.full_name || '',
            school: metadata.school || '',
            grade_levels: metadata.grade_levels ? metadata.grade_levels.split(',') : [],
            subjects: metadata.subjects ? metadata.subjects.split(',') : [],
            years_experience: metadata.years_experience ? parseInt(metadata.years_experience) : undefined
          });
          return newProfile;
        } catch (createError) {
          console.error('Failed to create profile from metadata:', createError);
          return null;
        }
      }

      return profile as TeacherProfile;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      return null;
    }
  },

  async updateProfile(profile: Partial<TeacherProfile>): Promise<TeacherProfile> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) throw new Error('No authenticated user');
    
    try {
      // Update profile in teacher_profiles table
      const { data, error } = await supabase
        .from('teacher_profiles')
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
      // Create profile in teacher_profiles table
      const { data, error } = await supabase
        .from('teacher_profiles')
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
