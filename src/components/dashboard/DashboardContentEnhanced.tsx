
import React from 'react';
import { PerformanceResult } from '@/services/dashboard-performance-service';
import { useEnhancedDashboard } from '@/hooks/useEnhancedDashboard';
import EnhancedWelcomeSection from './EnhancedWelcomeSection';
import DashboardBreadcrumbs from './DashboardBreadcrumbs';
import StatisticsCardEnhanced from './StatisticsCardEnhanced';
import { Users, FileText, Lightbulb, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { ValidationProvider } from '@/components/validation/FormValidationProvider';

interface DashboardContentEnhancedProps {
  data: PerformanceResult<any>;
}

const DashboardContentEnhanced: React.FC<DashboardContentEnhancedProps> = ({ data }) => {
  const dashboardData = data?.data || data;
  const enhancedData = useEnhancedDashboard(data);
  
  const teacher = dashboardData?.teacher || { full_name: 'Teacher', firstName: 'Teacher' };
  const metrics = dashboardData?.metrics || {};

  const statisticsCards = [
    {
      title: 'Total Students',
      value: metrics.totalStudents || 0,
      description: 'Active students in your classes',
      icon: Users,
      trend: {
        value: 8,
        label: 'vs last month',
        direction: 'up' as const,
        isPositive: true
      },
      progress: {
        value: metrics.totalStudents || 0,
        max: 30,
        label: 'Class capacity'
      }
    },
    {
      title: 'Assessments',
      value: metrics.totalAssessments || 0,
      description: 'Total assessments completed',
      icon: FileText,
      trend: {
        value: 12,
        label: 'this week',
        direction: 'up' as const,
        isPositive: true
      }
    },
    {
      title: 'AI Insights',
      value: metrics.aiInsights || 0,
      description: 'Generated recommendations and insights',
      icon: Lightbulb,
      trend: {
        value: 3,
        label: 'new today',
        direction: 'up' as const,
        isPositive: true
      },
      priority: 'medium' as const
    },
    {
      title: 'Performance Avg',
      value: `${metrics.averagePerformance || '85'}%`,
      description: 'Class average performance score',
      icon: TrendingUp,
      trend: {
        value: 2.3,
        label: 'improvement',
        direction: 'up' as const,
        isPositive: true
      }
    },
    {
      title: 'Need Attention',
      value: metrics.studentsNeedingAttention || 0,
      description: 'Students requiring additional support',
      icon: AlertTriangle,
      priority: metrics.studentsNeedingAttention > 0 ? 'high' as const : 'none' as const,
      trend: metrics.studentsNeedingAttention > 0 ? {
        value: metrics.studentsNeedingAttention,
        label: 'require support',
        direction: 'neutral' as const
      } : undefined
    },
    {
      title: 'Recent Activity',
      value: metrics.recentAssessments || 0,
      description: 'Assessments completed this week',
      icon: Clock,
      trend: {
        value: 25,
        label: 'vs last week',
        direction: 'up' as const,
        isPositive: true
      }
    }
  ];

  const contextualInfo = {
    totalStudents: metrics.totalStudents || 0,
    activeAssessments: metrics.totalAssessments || 0,
    upcomingDeadlines: metrics.studentsNeedingAttention || 0,
    recentInsights: metrics.todaysInsights || 0
  };

  return (
    <ValidationProvider>
      <div className="min-h-screen bg-background">
        {/* Breadcrumb Navigation */}
        <DashboardBreadcrumbs />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Enhanced Welcome Section */}
          <EnhancedWelcomeSection 
            teacher={teacher}
            contextualInfo={contextualInfo}
          />

          {/* Enhanced Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {statisticsCards.map((card, index) => (
              <StatisticsCardEnhanced
                key={index}
                title={card.title}
                value={card.value}
                description={card.description}
                icon={card.icon}
                trend={card.trend}
                progress={card.progress}
                priority={card.priority}
                onClick={() => console.log(`Clicked ${card.title}`)}
              />
            ))}
          </div>

          {/* Placeholder for other dashboard sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <p className="text-muted-foreground">Activity feed will be enhanced in Phase 2</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <p className="text-muted-foreground">Quick actions will be enhanced in Phase 2</p>
            </div>
          </div>
        </div>
      </div>
    </ValidationProvider>
  );
};

export default DashboardContentEnhanced;
