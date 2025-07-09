import React from 'react';
import EnhancedWelcomeSection from './EnhancedWelcomeSection';
import EnhancedAlertCard from './EnhancedAlertCard';
import EnhancedMetricCardWithTrends from './EnhancedMetricCardWithTrends';
import QuickActionsPanel from './QuickActionsPanel';
import DashboardLayout from './DashboardLayout';
import {
  LazyWrapper,
  LazyContainer,
  LazyActivityFeedEnhanced,
  LazyRecentInsightsEnhanced,
  LazySecondaryWidgetsEnhanced
} from '@/components/common/LazyComponentsEnhanced';
import {
  DSContentGrid,
  DSGridItem
} from '@/components/ui/design-system';
import { Users, FileText, Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';

interface DashboardContentProps {
  data: {
    students: any[];
    assessments: any[];
    metrics: {
      totalStudents: number;
      totalAssessments: number;
      recentAssessments: number;
      studentsNeedingAttention: number;
      averagePerformance: number;
    };
    teacher: {
      full_name?: string;
      firstName?: string;
    };
  };
}

// Component to handle the new layout structure
const ActivityAndInsightsWrapper: React.FC<{
  renderActivityOnly?: boolean;
  renderInsightsOnly?: boolean;
  recentAssessments: number;
  totalStudents: number;
  studentsNeedingAttention: number;
  students: any[];
}> = ({ 
  renderActivityOnly, 
  renderInsightsOnly, 
  recentAssessments, 
  totalStudents, 
  studentsNeedingAttention,
  students 
}) => {
  if (renderActivityOnly) {
    return (
      <LazyContainer>
        <LazyWrapper>
          <LazyActivityFeedEnhanced 
            recentAssessments={recentAssessments}
            totalStudents={totalStudents}
            studentsNeedingAttention={studentsNeedingAttention}
          />
        </LazyWrapper>
      </LazyContainer>
    );
  }
  
  if (renderInsightsOnly) {
    return (
      <LazyContainer>
        <LazyWrapper>
          <LazyRecentInsightsEnhanced 
            students={students}
            communications={[]}
          />
        </LazyWrapper>
      </LazyContainer>
    );
  }

  // Fallback for backward compatibility
  return (
    <DSContentGrid cols={3}>
      <DSGridItem span={2}>
        <LazyContainer>
          <LazyWrapper>
            <LazyActivityFeedEnhanced 
              recentAssessments={recentAssessments}
              totalStudents={totalStudents}
              studentsNeedingAttention={studentsNeedingAttention}
            />
          </LazyWrapper>
        </LazyContainer>
      </DSGridItem>
      
      <DSGridItem span={1}>
        <LazyContainer>
          <LazyWrapper>
            <LazyRecentInsightsEnhanced 
              students={students}
              communications={[]}
            />
          </LazyWrapper>
        </LazyContainer>
      </DSGridItem>
    </DSContentGrid>
  );
};

const DashboardContent: React.FC<DashboardContentProps> = ({ data }) => {
  const { students, assessments, metrics, teacher } = data;
  
  // Remove console.log for production performance

  // Generate sample sparkline data for trends
  const generateSparklineData = (baseValue: number, trend: 'up' | 'down' | 'stable') => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      if (trend === 'up') {
        data.push(baseValue + Math.random() * 10 + i * 2);
      } else if (trend === 'down') {
        data.push(baseValue - Math.random() * 5 - i);
      } else {
        data.push(baseValue + (Math.random() - 0.5) * 5);
      }
    }
    return data;
  };

  // Generate alerts from metrics
  const alerts = [];
  if (metrics.studentsNeedingAttention > 0) {
    alerts.push({
      id: 'performance-alert',
      type: 'performance' as const,
      title: 'Students Need Attention',
      description: `${metrics.studentsNeedingAttention} students are showing declining performance and may need additional support.`,
      severity: metrics.studentsNeedingAttention > metrics.totalStudents * 0.3 ? 'high' as const : 'medium' as const,
      actionUrl: '/app/students?filter=needs-attention',
      studentCount: metrics.studentsNeedingAttention
    });
  }

  // Prepare enhanced metrics with trends and progress
  const enhancedMetrics = [
    {
      title: 'Total Students',
      value: metrics.totalStudents,
      icon: <Users className="h-5 w-5" />,
      trend: {
        value: 'Active this month',
        direction: 'neutral' as const,
        isPositive: true
      },
      priority: 'low' as const,
      sparklineData: generateSparklineData(metrics.totalStudents, 'stable')
    },
    {
      title: 'Class Performance',
      value: metrics.averagePerformance > 0 ? `${Math.round(metrics.averagePerformance)}%` : 'No data',
      icon: <Target className="h-5 w-5" />,
      trend: {
        value: metrics.averagePerformance >= 75 ? 'Above target' : metrics.averagePerformance >= 60 ? 'On track' : 'Below target',
        direction: metrics.averagePerformance >= 75 ? 'up' as const : metrics.averagePerformance >= 60 ? 'neutral' as const : 'down' as const,
        percentage: metrics.averagePerformance > 0 ? Math.round((metrics.averagePerformance - 70)) : 0,
        isPositive: metrics.averagePerformance >= 75
      },
      priority: metrics.averagePerformance < 60 ? 'high' as const : 'low' as const,
      progress: metrics.averagePerformance,
      target: 100,
      sparklineData: generateSparklineData(metrics.averagePerformance, metrics.averagePerformance >= 75 ? 'up' : 'stable')
    },
    {
      title: 'Recent Assessments',
      value: metrics.recentAssessments,
      icon: <FileText className="h-5 w-5" />,
      trend: {
        value: metrics.recentAssessments > 0 ? 'This week' : 'No recent activity',
        direction: metrics.recentAssessments > 0 ? 'up' as const : 'neutral' as const,
        percentage: metrics.recentAssessments > 0 ? 15 : 0,
        isPositive: metrics.recentAssessments > 0
      },
      priority: metrics.recentAssessments === 0 ? 'medium' as const : 'low' as const,
      sparklineData: generateSparklineData(metrics.recentAssessments, 'up')
    },
    {
      title: 'AI Insights Generated',
      value: Math.floor(metrics.totalAssessments * 0.3),
      icon: <Brain className="h-5 w-5" />,
      trend: {
        value: 'Ready for review',
        direction: 'up' as const,
        percentage: 12,
        isPositive: true
      },
      priority: 'low' as const,
      progress: 75,
      sparklineData: generateSparklineData(Math.floor(metrics.totalAssessments * 0.3), 'up')
    },
    {
      title: 'Students Needing Attention',
      value: metrics.studentsNeedingAttention,
      icon: <AlertTriangle className="h-5 w-5" />,
      trend: {
        value: metrics.studentsNeedingAttention > 0 ? 'Requires action' : 'All on track',
        direction: metrics.studentsNeedingAttention > 0 ? 'down' as const : 'up' as const,
        percentage: metrics.studentsNeedingAttention > 0 ? -8 : 0,
        isPositive: metrics.studentsNeedingAttention === 0
      },
      priority: metrics.studentsNeedingAttention > 0 ? 'high' as const : 'low' as const,
      sparklineData: generateSparklineData(metrics.studentsNeedingAttention, 'down')
    },
    {
      title: 'High Performers',
      value: students.filter(s => s.student_performance?.[0]?.average_score > metrics.averagePerformance).length,
      icon: <TrendingUp className="h-5 w-5" />,
      trend: {
        value: 'Excelling students',
        direction: 'up' as const,
        percentage: 5,
        isPositive: true
      },
      priority: 'low' as const,
      progress: 65,
      sparklineData: generateSparklineData(students.filter(s => s.student_performance?.[0]?.average_score > metrics.averagePerformance).length, 'up')
    }
  ];

  const welcomeSection = (
    <EnhancedWelcomeSection 
      teacher={teacher} 
      metrics={{
        totalStudents: metrics.totalStudents,
        recentAssessments: metrics.recentAssessments
      }}
    />
  );

  const alertsSection = alerts.length > 0 ? <EnhancedAlertCard alerts={alerts} /> : null;

  const quickActions = (
    <QuickActionsPanel 
      metrics={{
        totalStudents: metrics.totalStudents,
        recentAssessments: metrics.recentAssessments,
        pendingGoals: Math.floor(students.length * 0.3)
      }}
    />
  );

  const metricsOverview = (
    <DSContentGrid cols={2}>
      {enhancedMetrics.map((metric, index) => (
        <DSGridItem key={index} span={1}>
          <EnhancedMetricCardWithTrends {...metric} />
        </DSGridItem>
      ))}
    </DSContentGrid>
  );

  const activityAndInsights = (
    <ActivityAndInsightsWrapper
      recentAssessments={metrics.recentAssessments}
      totalStudents={metrics.totalStudents}
      studentsNeedingAttention={metrics.studentsNeedingAttention}
      students={students}
    />
  );

  const additionalTools = (
    <LazyContainer>
      <LazyWrapper>
        <LazySecondaryWidgetsEnhanced 
          assessments={assessments}
          students={students}
          metrics={{
            averagePerformance: metrics.averagePerformance > 0 
              ? `${Math.round(metrics.averagePerformance)}%` 
              : 'No data',
            studentsNeedingAttention: metrics.studentsNeedingAttention
          }}
        />
      </LazyWrapper>
    </LazyContainer>
  );

  return (
    <DashboardLayout
      welcomeSection={welcomeSection}
      alertsSection={alertsSection}
      quickActions={quickActions}
      metricsOverview={metricsOverview}
      activityAndInsights={activityAndInsights}
      additionalTools={additionalTools}
    />
  );
};

export default DashboardContent;
