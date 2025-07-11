import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/services/auth-service';
import { TeacherProfile } from '@/types/auth';
import { errorService } from '@/services/error-service';

interface AuthContextType {
  user: User | null;
  profile: TeacherProfile | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (data: any) => Promise<any>;
  signIn: (data: any) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<TeacherProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('AuthContext: Fetching profile for user:', userId);
      const profileData = await authService.getProfile();
      setProfile(profileData);
      console.log('AuthContext: Profile fetched successfully:', profileData);
    } catch (error) {
      errorService.logError('AuthContext', error as Error, { userId, action: 'fetchProfile' });
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    console.log('AuthContext: Initializing auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('AuthContext: Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event !== 'TOKEN_REFRESHED') {
          // Only fetch profile for significant auth events, not token refresh
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
            }
          }, 0);
        } else if (!session) {
          setProfile(null);
        }
        
        if (!initialized) {
          setIsLoading(false);
          setInitialized(true);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('AuthContext: Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          if (mounted) {
            fetchProfile(session.user.id);
          }
        }, 0);
      }
      
      setIsLoading(false);
      setInitialized(true);
    });

    return () => {
      mounted = false;
      console.log('AuthContext: Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: any) => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Attempting signup');
      const result = await authService.signUp(data);
      console.log('AuthContext: Signup successful');
      return result;
    } catch (error) {
      errorService.logError('AuthContext', error as Error, { action: 'signUp', data: { ...data, password: '[REDACTED]' } }, undefined, true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (data: any) => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Attempting signin');
      const result = await authService.signIn(data);
      console.log('AuthContext: Signin successful');
      return result;
    } catch (error) {
      errorService.logError('AuthContext', error as Error, { action: 'signIn', email: data.email }, undefined, true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Attempting signout');
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      console.log('AuthContext: Signout successful');
    } catch (error) {
      errorService.logError('AuthContext', error as Error, { action: 'signOut' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<TeacherProfile>) => {
    try {
      const updatedProfile = await authService.updateProfile(data);
      setProfile(updatedProfile);
    } catch (error) {
      errorService.logError('AuthContext', error as Error, { action: 'updateProfile', data });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      errorService.logError('AuthContext', error as Error, { action: 'resetPassword', email });
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      await authService.updatePassword(password);
    } catch (error) {
      errorService.logError('AuthContext', error as Error, { action: 'updatePassword' });
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};