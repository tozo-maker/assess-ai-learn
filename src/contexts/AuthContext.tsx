
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/services/auth-service';
import { AuthState, SignInData, SignUpData, TeacherProfile } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<TeacherProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    error: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(prev => ({ ...prev, session, user: session?.user ?? null }));
        
        // Fetch user profile when auth state changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setState(prev => ({ ...prev, profile: null }));
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({ ...prev, session, user: session?.user ?? null }));
      
      // Fetch initial user profile if session exists
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await authService.getProfile();
      setState(prev => ({ 
        ...prev, 
        profile, 
        isLoading: false,
        error: null 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: (error as Error).message 
      }));
    }
  };

  const signUp = async (data: SignUpData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.signUp(data);
      toast({
        title: "Account created",
        description: "Please check your email to verify your account."
      });
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: (error as Error).message 
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message
      });
    }
  };

  const signIn = async (data: SignInData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { session, user } = await authService.signIn(data);
      setState(prev => ({ 
        ...prev, 
        session, 
        user,
        isLoading: false 
      }));
      toast({
        title: "Welcome back",
        description: "You've successfully signed in."
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: (error as Error).message 
      }));
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: (error as Error).message
      });
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setState({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message
      });
    }
  };

  const updateProfile = async (profile: Partial<TeacherProfile>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const updatedProfile = await authService.updateProfile(profile);
      setState(prev => ({ 
        ...prev,
        profile: updatedProfile,
        isLoading: false,
        error: null
      }));
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: (error as Error).message 
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message
      });
    }
  };

  const resetPassword = async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.resetPassword(email);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Password reset initiated",
        description: "Please check your email for instructions."
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: (error as Error).message 
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message
      });
    }
  };

  const updatePassword = async (password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.updatePassword(password);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully."
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: (error as Error).message 
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        updateProfile,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
