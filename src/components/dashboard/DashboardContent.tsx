
import React from 'react';
import { Link } from 'react-router-dom';
import DashboardWelcomeSection from '@/components/dashboard/DashboardWelcomeSection';
import DashboardAlerts from '@/components/dashboard/DashboardAlerts';
import DashboardStatsRedesigned from '@/components/dashboard/DashboardStatsRedesigned';
import {
  LazyWrapper,
  LazyContainer,
  LazyActivityFeed,
  LazyRecentInsights,
  LazySecondaryWidgets
} from '@/components/common/LazyComponents';
import {
  DSSection,
  DSPageContainer,
  DSContentGrid,
  DSGridItem,
  DSSpacer
} from '@/components/ui/design-system';

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

const DashboardContent: React.FC<DashboardContentProps> = ({ data }) => {
  const { students, assessments, metrics, teacher } = data;
  
  console.log('DashboardContent render:', { studentsCount: students?.length, assessmentsCount: assessments?.length, metrics });

  // Generate alerts from metrics
  const alerts = [];
  if (metrics.studentsNeedingAttention > 0) {
    alerts.push({
      id: 'performance-alert',
      type: 'performance' as const,
      title: 'Students Need Attention',
      description: `${metrics.studentsNeedingAttention} students showing declining performance`,
      severity: metrics.studentsNeedingAttention > metrics.totalStudents * 0.3 ? 'high' as const : 'medium' as const,
      actionUrl: '/app/students?filter=needs-attention',
      studentCount: metrics.studentsNeedingAttention
    });
  }

  return (
    <DSSection>
      <DSPageContainer>
        {/* Welcome Section */}
        <DashboardWelcomeSection teacher={teacher} />
        <DSSpacer size="2xl" />

        {/* Critical Alerts */}
        {alerts.length > 0 && (
          <>
            <DashboardAlerts alerts={alerts} />
            <DSSpacer size="2xl" />
          </>
        )}

        {/* Primary Metrics */}
        <LazyContainer>
          <LazyWrapper>
            <DashboardStatsRedesigned 
              totalStudents={metrics.totalStudents}
              totalAssessments={metrics.totalAssessments}
              aiInsights={Math.floor(metrics.totalAssessments * 0.3)}
              recentAssessments={metrics.recentAssessments}
              newStudentsThisMonth={0}
              todaysInsights={Math.floor(metrics.totalAssessments * 0.1)}
              studentMetrics={{
                totalStudents: metrics.totalStudents,
                studentsNeedingAttention: metrics.studentsNeedingAttention,
                aboveAverageCount: students.filter(s => 
                  s.student_performance?.[0]?.average_score > metrics.averagePerformance
                ).length,
                averagePerformance: metrics.averagePerformance > 0 
                  ? `${Math.round(metrics.averagePerformance)}%` 
                  : 'No data'
              }}
            />
          </LazyWrapper>
        </LazyContainer>

        <DSSpacer size="2xl" />

        {/* Main Content Grid */}
        <DSContentGrid cols={3}>
          <DSGridItem span={2}>
            <LazyContainer>
              <LazyWrapper>
                <LazyActivityFeed 
                  recentAssessments={metrics.recentAssessments}
                  totalStudents={metrics.totalStudents}
                  studentsNeedingAttention={metrics.studentsNeedingAttention}
                />
              </LazyWrapper>
            </LazyContainer>
          </DSGridItem>
          
          <DSGridItem span={1}>
            <div className="space-y-6">
              <LazyContainer>
                <LazyWrapper>
                  <LazyRecentInsights 
                    students={students}
                    communications={[]}
                  />
                </LazyWrapper>
              </LazyContainer>
            </div>
          </DSGridItem>
        </DSContentGrid>

        <DSSpacer size="2xl" />

        {/* Secondary Widgets */}
        <LazyContainer>
          <LazyWrapper>
            <LazySecondaryWidgets 
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

        <DSSpacer size="3xl" />
      </DSPageContainer>
    </DSSection>
  );
};

export default DashboardContent;
