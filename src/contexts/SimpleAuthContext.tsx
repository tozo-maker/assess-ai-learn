
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/services/production-logger';

interface SignInData {
  email: string;
  password: string;
  remember?: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  school?: string;
  gradeLevels?: string[];
  subjects?: string[];
  yearsExperience?: number;
}

interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (data: SignInData) => Promise<{ user: User | null; session: Session | null }>;
  signUp: (data: SignUpData) => Promise<{ user: User | null; session: Session | null }>;
  signOut: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        productionLogger.debug('Auth state changed', { event, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      productionLogger.debug('Initial session check', { userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (data: SignInData) => {
    try {
      productionLogger.info('Attempting user signin', { email: data.email });
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) throw error;
      
      productionLogger.info('Signin successful', { email: data.email });
      return authData;
    } catch (error) {
      productionLogger.error('Signin failed', error as Error, { email: data.email });
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      productionLogger.info('Attempting user signup', { email: data.email });
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: data.fullName,
            school: data.school || '',
            grade_levels: data.gradeLevels?.join(',') || '',
            subjects: data.subjects?.join(',') || '',
            years_experience: data.yearsExperience || null
          }
        }
      });

      if (error) throw error;
      
      productionLogger.info('Signup successful', { email: data.email });
      return authData;
    } catch (error) {
      productionLogger.error('Signup failed', error as Error, { email: data.email });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      productionLogger.info('Attempting user signout');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      productionLogger.info('Signout successful');
    } catch (error) {
      productionLogger.error('Signout failed', error as Error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <SimpleAuthContext.Provider value={value}>{children}</SimpleAuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
