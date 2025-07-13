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
    summary: {
      totalStudents: number;
      totalAssessments: number;
      averageScore: number;
      studentsNeedingAttention: number;
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
  const { students, assessments, summary, teacher } = data;
  
  // Production-ready dashboard content rendering

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

  // Generate alerts from summary
  const alerts = [];
  if (summary.studentsNeedingAttention > 0) {
    alerts.push({
      id: 'performance-alert',
      type: 'performance' as const,
      title: 'Students Need Attention',
      description: `${summary.studentsNeedingAttention} students are showing declining performance and may need additional support.`,
      severity: summary.studentsNeedingAttention > summary.totalStudents * 0.3 ? 'high' as const : 'medium' as const,
      actionUrl: '/app/students?filter=needs-attention',
      studentCount: summary.studentsNeedingAttention
    });
  }

  // Prepare enhanced metrics with trends and progress
  const enhancedMetrics = [
    {
      title: 'Total Students',
      value: summary.totalStudents,
      icon: <Users className="h-5 w-5" />,
      trend: {
        value: 'Active this month',
        direction: 'neutral' as const,
        isPositive: true
      },
      priority: 'low' as const,
      sparklineData: generateSparklineData(summary.totalStudents, 'stable')
    },
    {
      title: 'Class Performance',
      value: summary.averageScore > 0 ? `${Math.round(summary.averageScore)}%` : 'No data',
      icon: <Target className="h-5 w-5" />,
      trend: {
        value: summary.averageScore >= 75 ? 'Above target' : summary.averageScore >= 60 ? 'On track' : 'Below target',
        direction: summary.averageScore >= 75 ? 'up' as const : summary.averageScore >= 60 ? 'neutral' as const : 'down' as const,
        percentage: summary.averageScore > 0 ? Math.round((summary.averageScore - 70)) : 0,
        isPositive: summary.averageScore >= 75
      },
      priority: summary.averageScore < 60 ? 'high' as const : 'low' as const,
      progress: summary.averageScore,
      target: 100,
      sparklineData: generateSparklineData(summary.averageScore, summary.averageScore >= 75 ? 'up' : 'stable')
    },
    {
      title: 'Total Assessments',
      value: summary.totalAssessments,
      icon: <FileText className="h-5 w-5" />,
      trend: {
        value: summary.totalAssessments > 0 ? 'Available' : 'No assessments',
        direction: summary.totalAssessments > 0 ? 'up' as const : 'neutral' as const,
        percentage: summary.totalAssessments > 0 ? 15 : 0,
        isPositive: summary.totalAssessments > 0
      },
      priority: summary.totalAssessments === 0 ? 'medium' as const : 'low' as const,
      sparklineData: generateSparklineData(summary.totalAssessments, 'up')
    },
    {
      title: 'AI Insights Generated',
      value: Math.floor(summary.totalAssessments * 0.3),
      icon: <Brain className="h-5 w-5" />,
      trend: {
        value: 'Ready for review',
        direction: 'up' as const,
        percentage: 12,
        isPositive: true
      },
      priority: 'low' as const,
      progress: 75,
      sparklineData: generateSparklineData(Math.floor(summary.totalAssessments * 0.3), 'up')
    },
    {
      title: 'Students Needing Attention',
      value: summary.studentsNeedingAttention,
      icon: <AlertTriangle className="h-5 w-5" />,
      trend: {
        value: summary.studentsNeedingAttention > 0 ? 'Requires action' : 'All on track',
        direction: summary.studentsNeedingAttention > 0 ? 'down' as const : 'up' as const,
        percentage: summary.studentsNeedingAttention > 0 ? -8 : 0,
        isPositive: summary.studentsNeedingAttention === 0
      },
      priority: summary.studentsNeedingAttention > 0 ? 'high' as const : 'low' as const,
      sparklineData: generateSparklineData(summary.studentsNeedingAttention, 'down')
    },
    {
      title: 'High Performers',
      value: students.filter(s => s.student_performance?.[0]?.average_score > summary.averageScore).length,
      icon: <TrendingUp className="h-5 w-5" />,
      trend: {
        value: 'Excelling students',
        direction: 'up' as const,
        percentage: 5,
        isPositive: true
      },
      priority: 'low' as const,
      progress: 65,
      sparklineData: generateSparklineData(students.filter(s => s.student_performance?.[0]?.average_score > summary.averageScore).length, 'up')
    }
  ];

  const welcomeSection = (
    <EnhancedWelcomeSection 
      teacher={teacher} 
      metrics={{
        totalStudents: summary.totalStudents,
        recentAssessments: summary.totalAssessments
      }}
    />
  );

  const alertsSection = alerts.length > 0 ? <EnhancedAlertCard alerts={alerts} /> : null;

  const quickActions = (
    <QuickActionsPanel 
      metrics={{
        totalStudents: summary.totalStudents,
        recentAssessments: summary.totalAssessments,
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
      recentAssessments={summary.totalAssessments}
      totalStudents={summary.totalStudents}
      studentsNeedingAttention={summary.studentsNeedingAttention}
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
            averagePerformance: summary.averageScore > 0 
              ? `${Math.round(summary.averageScore)}%` 
              : 'No data',
            studentsNeedingAttention: summary.studentsNeedingAttention
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
