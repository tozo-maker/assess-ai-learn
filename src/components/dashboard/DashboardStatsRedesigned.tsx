
import React from 'react';
import { TrendingUp, Users, BookOpen, Brain, Target, Calendar } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSSection,
  DSContentGrid,
  DSGridItem
} from '@/components/ui/design-system';

interface DashboardStatsProps {
  totalStudents: number;
  totalAssessments: number;
  aiInsights: number;
  recentAssessments: number;
  newStudentsThisMonth: number;
  todaysInsights: number;
  studentMetrics?: {
    totalStudents: number;
    studentsNeedingAttention: number;
    aboveAverageCount: number;
    averagePerformance: string;
  };
}

const DashboardStatsRedesigned: React.FC<DashboardStatsProps> = ({
  totalStudents = 0,
  totalAssessments = 0,
  aiInsights = 0,
  recentAssessments = 0,
  newStudentsThisMonth = 0,
  todaysInsights = 0,
  studentMetrics
}) => {
  // Safe access to studentMetrics with defaults
  const safeStudentMetrics = {
    totalStudents: studentMetrics?.totalStudents || totalStudents || 0,
    studentsNeedingAttention: studentMetrics?.studentsNeedingAttention || 0,
    aboveAverageCount: studentMetrics?.aboveAverageCount || 0,
    averagePerformance: studentMetrics?.averagePerformance || 'No data'
  };

  const primaryStats = [
    {
      title: 'Total Students',
      value: safeStudentMetrics.totalStudents.toString(),
      icon: <Users className="h-5 w-5 text-blue-600" />,
      trend: newStudentsThisMonth > 0 ? `+${newStudentsThisMonth} this month` : 'No new students'
    },
    {
      title: 'Assessments',
      value: (totalAssessments || 0).toString(),
      icon: <BookOpen className="h-5 w-5 text-green-600" />,
      trend: recentAssessments > 0 ? `${recentAssessments} recent` : 'No recent assessments'
    },
    {
      title: 'AI Insights',
      value: (aiInsights || 0).toString(),
      icon: <Brain className="h-5 w-5 text-purple-600" />,
      trend: todaysInsights > 0 ? `${todaysInsights} today` : 'No insights today'
    }
  ];

  const performanceStats = [
    {
      title: 'Students Needing Attention',
      value: safeStudentMetrics.studentsNeedingAttention.toString(),
      icon: <Target className="h-5 w-5 text-red-600" />,
      color: 'text-red-600'
    },
    {
      title: 'Above Average Performance',
      value: safeStudentMetrics.aboveAverageCount.toString(),
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      color: 'text-green-600'
    },
    {
      title: 'Average Performance',
      value: safeStudentMetrics.averagePerformance,
      icon: <Calendar className="h-5 w-5 text-blue-600" />,
      color: 'text-blue-600'
    }
  ];

  return (
    <DSSection>
      {/* Primary Statistics */}
      <DSContentGrid cols={3}>
        {primaryStats.map((stat, index) => (
          <DSGridItem key={index} span={1}>
            <DSCard>
              <DSCardContent className="p-6">
                <DSFlexContainer align="center" justify="between">
                  <div>
                    <DSBodyText className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </DSBodyText>
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <DSBodyText className="text-xs text-gray-500 mt-1">
                      {stat.trend}
                    </DSBodyText>
                  </div>
                  <div className="ml-4">
                    {stat.icon}
                  </div>
                </DSFlexContainer>
              </DSCardContent>
            </DSCard>
          </DSGridItem>
        ))}
      </DSContentGrid>

      {/* Performance Metrics */}
      <div className="mt-6">
        <DSCard>
          <DSCardHeader>
            <DSCardTitle>Performance Overview</DSCardTitle>
          </DSCardHeader>
          <DSCardContent>
            <DSContentGrid cols={3}>
              {performanceStats.map((stat, index) => (
                <DSGridItem key={index} span={1}>
                  <DSFlexContainer align="center" gap="md">
                    {stat.icon}
                    <div>
                      <DSBodyText className="text-sm text-gray-600">
                        {stat.title}
                      </DSBodyText>
                      <div className={`text-lg font-semibold ${stat.color || 'text-gray-900'}`}>
                        {stat.value}
                      </div>
                    </div>
                  </DSFlexContainer>
                </DSGridItem>
              ))}
            </DSContentGrid>
          </DSCardContent>
        </DSCard>
      </div>
    </DSSection>
  );
};

export default DashboardStatsRedesigned;
