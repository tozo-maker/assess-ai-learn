
import React, { createContext, useContext, ReactNode } from 'react';

interface DesignSystemContextType {
  theme: 'light' | 'dark';
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  colors: {
    primary: string;
    success: string;
    warning: string;
    danger: string;
    neutral: string;
  };
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined);

export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
};

interface DesignSystemProviderProps {
  children: ReactNode;
}

export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = ({ children }) => {
  const value: DesignSystemContextType = {
    theme: 'light',
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px',
      '3xl': '64px',
    },
    colors: {
      primary: '#2563eb',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      neutral: '#6b7280',
    },
  };

  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  );
};
