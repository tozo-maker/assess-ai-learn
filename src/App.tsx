
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { DesignSystemProvider } from '@/contexts/DesignSystemContext';
import AppRoutes from '@/components/routing/AppRoutes';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="App">
              <AppRoutes />
              <Toaster />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </DesignSystemProvider>
    </QueryClientProvider>
  );
}

export default App;
