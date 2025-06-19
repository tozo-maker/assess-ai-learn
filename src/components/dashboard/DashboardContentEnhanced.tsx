import React from 'react';
import EnhancedWelcomeSection from './EnhancedWelcomeSection';
import EnhancedAlertCard from './EnhancedAlertCard';
import EnhancedMetricCard from './EnhancedMetricCard';
import {
  LazyWrapper,
  LazyContainer,
  LazyActivityFeedEnhanced,
  LazyRecentInsightsEnhanced,
  LazySecondaryWidgetsEnhanced
} from '@/components/common/LazyComponentsEnhanced';
import {
  DSSection,
  DSPageContainer,
  DSContentGrid,
  DSGridItem,
  DSSpacer,
  DSSectionHeader
} from '@/components/ui/design-system';
import { Users, FileText, Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';

interface DashboardContentEnhancedProps {
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

const DashboardContentEnhanced: React.FC<DashboardContentEnhancedProps> = ({ data }) => {
  const { students, assessments, metrics, teacher } = data;
  
  console.log('DashboardContentEnhanced render:', { 
    studentsCount: students?.length, 
    assessmentsCount: assessments?.length, 
    metrics 
  });

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

  // Prepare enhanced metrics
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
      priority: 'low' as const
    },
    {
      title: 'Recent Assessments',
      value: metrics.recentAssessments,
      icon: <FileText className="h-5 w-5" />,
      trend: {
        value: metrics.recentAssessments > 0 ? 'This week' : 'No recent activity',
        direction: metrics.recentAssessments > 0 ? 'up' as const : 'neutral' as const,
        isPositive: metrics.recentAssessments > 0
      },
      priority: metrics.recentAssessments === 0 ? 'medium' as const : 'low' as const
    },
    {
      title: 'AI Insights Generated',
      value: Math.floor(metrics.totalAssessments * 0.3),
      icon: <Brain className="h-5 w-5" />,
      trend: {
        value: 'Ready for review',
        direction: 'up' as const,
        isPositive: true
      },
      priority: 'low' as const
    },
    {
      title: 'Students Needing Attention',
      value: metrics.studentsNeedingAttention,
      icon: <AlertTriangle className="h-5 w-5" />,
      trend: {
        value: metrics.studentsNeedingAttention > 0 ? 'Requires action' : 'All on track',
        direction: metrics.studentsNeedingAttention > 0 ? 'down' as const : 'up' as const,
        isPositive: metrics.studentsNeedingAttention === 0
      },
      priority: metrics.studentsNeedingAttention > 0 ? 'high' as const : 'low' as const
    },
    {
      title: 'Average Performance',
      value: metrics.averagePerformance > 0 ? `${Math.round(metrics.averagePerformance)}%` : 'No data',
      icon: <Target className="h-5 w-5" />,
      trend: {
        value: metrics.averagePerformance >= 75 ? 'Above target' : metrics.averagePerformance >= 60 ? 'On track' : 'Below target',
        direction: metrics.averagePerformance >= 75 ? 'up' as const : metrics.averagePerformance >= 60 ? 'neutral' as const : 'down' as const,
        isPositive: metrics.averagePerformance >= 75
      },
      priority: metrics.averagePerformance < 60 ? 'medium' as const : 'low' as const
    },
    {
      title: 'High Performers',
      value: students.filter(s => s.student_performance?.[0]?.average_score > metrics.averagePerformance).length,
      icon: <TrendingUp className="h-5 w-5" />,
      trend: {
        value: 'Excelling students',
        direction: 'up' as const,
        isPositive: true
      },
      priority: 'low' as const
    }
  ];

  return (
    <DSSection>
      <DSPageContainer>
        {/* Enhanced Welcome Section */}
        <EnhancedWelcomeSection 
          teacher={teacher} 
          metrics={{
            totalStudents: metrics.totalStudents,
            recentAssessments: metrics.recentAssessments
          }}
        />
        <DSSpacer size="2xl" />

        {/* Critical Alerts */}
        {alerts.length > 0 && (
          <>
            <EnhancedAlertCard alerts={alerts} />
            <DSSpacer size="2xl" />
          </>
        )}

        {/* Key Metrics Section */}
        <div>
          <DSSectionHeader className="mb-6">Performance Overview</DSSectionHeader>
          <DSContentGrid cols={3}>
            {enhancedMetrics.map((metric, index) => (
              <DSGridItem key={index} span={1}>
                <EnhancedMetricCard {...metric} />
              </DSGridItem>
            ))}
          </DSContentGrid>
        </div>

        <DSSpacer size="2xl" />

        {/* Recent Activity & AI Insights - Side by Side */}
        <div>
          <DSSectionHeader className="mb-6">Recent Activity & AI Insights</DSSectionHeader>
          <DSContentGrid cols={2}>
            <DSGridItem span={1}>
              <LazyContainer>
                <LazyWrapper>
                  <LazyActivityFeedEnhanced 
                    recentAssessments={metrics.recentAssessments}
                    totalStudents={metrics.totalStudents}
                    studentsNeedingAttention={metrics.studentsNeedingAttention}
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
        </div>

        <DSSpacer size="2xl" />

        {/* Secondary Widgets */}
        <div>
          <DSSectionHeader className="mb-6">Additional Tools</DSSectionHeader>
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
        </div>

        <DSSpacer size="3xl" />
      </DSPageContainer>
    </DSSection>
  );
};

export default DashboardContentEnhanced;
