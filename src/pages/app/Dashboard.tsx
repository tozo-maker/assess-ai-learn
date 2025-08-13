
import React from 'react';
import { useOptimizedDashboardData } from '@/hooks/useOptimizedDashboardData';
import IntegratedDashboard from '@/components/dashboard/IntegratedDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useOptimizedDashboardData();

  useSEO({
    title: 'Dashboard | LearnSpark AI',
    description: 'Teacher dashboard for student performance insights and actionable recommendations.',
    canonicalPath: '/app/dashboard'
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Loading Dashboard</h2>
            <p className="text-muted-foreground">Preparing your educational insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="border-destructive bg-destructive/5 max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              Dashboard Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {(error as Error).message || 'Failed to load dashboard data'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Reload Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <IntegratedDashboard data={data} />;
};

export default Dashboard;
