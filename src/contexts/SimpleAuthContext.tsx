import React, { createContext, useContext, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const value = {
    user,
    session,
    isLoading,
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