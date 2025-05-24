
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
      // For now, create a mock profile from user metadata until teacher_profiles table is created
      const userMetadata = user.user.user_metadata;
      
      if (userMetadata && userMetadata.full_name) {
        // Handle grade_levels - it might be a string or array
        let gradeLevels: string[] = [];
        if (userMetadata.grade_levels) {
          if (Array.isArray(userMetadata.grade_levels)) {
            gradeLevels = userMetadata.grade_levels;
          } else if (typeof userMetadata.grade_levels === 'string') {
            gradeLevels = userMetadata.grade_levels.split(',');
          }
        }

        // Handle subjects - it might be a string or array
        let subjects: string[] = [];
        if (userMetadata.subjects) {
          if (Array.isArray(userMetadata.subjects)) {
            subjects = userMetadata.subjects;
          } else if (typeof userMetadata.subjects === 'string') {
            subjects = userMetadata.subjects.split(',');
          }
        }

        return {
          id: user.user.id,
          full_name: userMetadata.full_name,
          school: userMetadata.school,
          grade_levels: gradeLevels,
          subjects: subjects,
          years_experience: userMetadata.years_experience,
          created_at: user.user.created_at,
          updated_at: user.user.updated_at || user.user.created_at
        } as TeacherProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      return null;
    }
  },

  async updateProfile(profile: Partial<TeacherProfile>): Promise<TeacherProfile> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) throw new Error('No authenticated user');
    
    try {
      // Update user metadata until teacher_profiles table is created
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          school: profile.school,
          grade_levels: profile.grade_levels?.join(','),
          subjects: profile.subjects?.join(','),
          years_experience: profile.years_experience
        }
      });
      
      if (error) throw error;
      
      // Return updated profile
      const updatedMetadata = data.user?.user_metadata;
      return {
        id: user.user.id,
        full_name: updatedMetadata?.full_name || profile.full_name || '',
        school: updatedMetadata?.school || profile.school,
        grade_levels: updatedMetadata?.grade_levels ? 
          (Array.isArray(updatedMetadata.grade_levels) ? 
            updatedMetadata.grade_levels : 
            updatedMetadata.grade_levels.split(',')) : 
          profile.grade_levels || [],
        subjects: updatedMetadata?.subjects ? 
          (Array.isArray(updatedMetadata.subjects) ? 
            updatedMetadata.subjects : 
            updatedMetadata.subjects.split(',')) : 
          profile.subjects || [],
        years_experience: updatedMetadata?.years_experience || profile.years_experience,
        created_at: user.user.created_at,
        updated_at: new Date().toISOString()
      } as TeacherProfile;
    } catch (error) {
      console.error('Error updating teacher profile:', error);
      throw error;
    }
  },

  async createProfile(profile: Omit<TeacherProfile, 'id' | 'created_at' | 'updated_at'>): Promise<TeacherProfile> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) throw new Error('No authenticated user');
    
    try {
      // For now, store in user metadata until teacher_profiles table is created
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          school: profile.school,
          grade_levels: profile.grade_levels.join(','),
          subjects: profile.subjects.join(','),
          years_experience: profile.years_experience
        }
      });
      
      if (error) throw error;
      
      return {
        id: user.user.id,
        ...profile,
        created_at: user.user.created_at,
        updated_at: new Date().toISOString()
      } as TeacherProfile;
    } catch (error) {
      console.error('Error creating teacher profile:', error);
      throw error;
    }
  }
};
