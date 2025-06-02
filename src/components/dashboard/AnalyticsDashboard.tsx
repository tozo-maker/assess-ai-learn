
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSButton,
  DSFlexContainer,
  DSBodyText,
  DSSpacer,
  DSContentGrid,
  DSStatusBadge,
  designSystem
} from '@/components/ui/design-system';

interface AnalyticsData {
  totalStudents: number;
  totalAssessments: number;
  averagePerformance: number;
  studentsAtRisk: number;
  studentsExcelling: number;
  recentGrowth: number;
  completionRate: number;
  engagementScore: number;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, className = "" }) => {
  const getPerformanceBadge = (score: number) => {
    if (score >= 85) return { variant: 'success' as const, label: 'Excellent' };
    if (score >= 70) return { variant: 'warning' as const, label: 'Good' };
    return { variant: 'danger' as const, label: 'Needs Attention' };
  };

  const performanceBadge = getPerformanceBadge(data.averagePerformance);

  const keyMetrics = [
    {
      label: "Total Students",
      value: data.totalStudents,
      icon: <Users className="h-6 w-6" />,
      variant: 'primary' as const
    },
    {
      label: "Assessments",
      value: data.totalAssessments,
      icon: <BookOpen className="h-6 w-6" />,
      variant: 'success' as const
    },
    {
      label: "Avg Performance",
      value: `${data.averagePerformance}%`,
      icon: <Target className="h-6 w-6" />,
      variant: data.averagePerformance >= 85 ? 'success' as const : 
             data.averagePerformance >= 70 ? 'warning' as const : 'danger' as const
    },
    {
      label: "Completion Rate",
      value: `${data.completionRate}%`,
      icon: <Clock className="h-6 w-6" />,
      variant: 'warning' as const
    }
  ];

  const getVariantStyles = (variant: string) => {
    return designSystem.colors[variant as keyof typeof designSystem.colors];
  };

  return (
    <DSCard className={className}>
      <DSCardHeader>
        <DSCardTitle>
          <DSFlexContainer justify="between" align="center">
            <DSFlexContainer align="center" gap="sm">
              <TrendingUp className={`h-5 w-5 ${designSystem.colors.primary.text}`} />
              <span>Class Analytics Overview</span>
            </DSFlexContainer>
            <DSStatusBadge variant={performanceBadge.variant}>
              {performanceBadge.label}
            </DSStatusBadge>
          </DSFlexContainer>
        </DSCardTitle>
      </DSCardHeader>
      <DSCardContent className="space-y-8">
        {/* Key Metrics Grid */}
        <DSContentGrid cols={4} className="gap-4">
          {keyMetrics.map((metric, index) => {
            const styles = getVariantStyles(metric.variant);
            return (
              <div key={index} className={`text-center p-4 ${styles.light} rounded-lg`}>
                <div className={`${styles.text} mx-auto mb-2`}>
                  {metric.icon}
                </div>
                <div className="space-y-2">
                  <DSBodyText className="text-sm font-medium text-gray-600">
                    {metric.label}
                  </DSBodyText>
                  <div className={`text-3xl font-bold ${styles.text}`}>
                    {metric.value}
                  </div>
                </div>
              </div>
            );
          })}
        </DSContentGrid>

        {/* Performance Insights */}
        <DSContentGrid cols={2} className="gap-6">
          <DSCard className={`transition-all ${designSystem.transitions.normal} hover:shadow-md`}>
            <DSFlexContainer justify="between" align="center" className="mb-4 p-4">
              <DSBodyText className="font-medium text-gray-900">Students at Risk</DSBodyText>
              <AlertTriangle className={`h-4 w-4 ${designSystem.colors.danger.text}`} />
            </DSFlexContainer>
            <div className="px-4 pb-4">
              <div className={`text-3xl font-bold ${designSystem.colors.danger.text} mb-2`}>
                {data.studentsAtRisk}
              </div>
              <DSBodyText className="text-sm text-gray-600 mb-4">
                Need immediate attention
              </DSBodyText>
              <Link to="/app/students">
                <DSButton variant="secondary" size="sm" className="w-full">
                  View Details
                </DSButton>
              </Link>
            </div>
          </DSCard>

          <DSCard className={`transition-all ${designSystem.transitions.normal} hover:shadow-md`}>
            <DSFlexContainer justify="between" align="center" className="mb-4 p-4">
              <DSBodyText className="font-medium text-gray-900">High Performers</DSBodyText>
              <CheckCircle className={`h-4 w-4 ${designSystem.colors.success.text}`} />
            </DSFlexContainer>
            <div className="px-4 pb-4">
              <div className={`text-3xl font-bold ${designSystem.colors.success.text} mb-2`}>
                {data.studentsExcelling}
              </div>
              <DSBodyText className="text-sm text-gray-600 mb-4">
                Exceeding expectations
              </DSBodyText>
              <Link to="/app/insights/class">
                <DSButton variant="secondary" size="sm" className="w-full">
                  View Insights
                </DSButton>
              </Link>
            </div>
          </DSCard>
        </DSContentGrid>

        {/* Growth Indicator */}
        <div className={`p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg`}>
          <DSFlexContainer justify="between" align="center">
            <div>
              <DSBodyText className="font-medium text-gray-900 mb-1">Recent Growth</DSBodyText>
              <DSBodyText className="text-gray-600">Compared to last month</DSBodyText>
            </div>
            <DSFlexContainer align="center" gap="sm">
              {data.recentGrowth > 0 ? (
                <TrendingUp className={`h-5 w-5 ${designSystem.colors.success.text}`} />
              ) : (
                <TrendingDown className={`h-5 w-5 ${designSystem.colors.danger.text}`} />
              )}
              <span className={`text-lg font-bold ${
                data.recentGrowth > 0 ? designSystem.colors.success.text : designSystem.colors.danger.text
              }`}>
                {data.recentGrowth > 0 ? '+' : ''}{data.recentGrowth}%
              </span>
            </DSFlexContainer>
          </DSFlexContainer>
        </div>

        {/* Quick Actions */}
        <DSFlexContainer gap="sm">
          <Link to="/app/assessments/add" className="flex-1">
            <DSButton variant="secondary" size="sm" className="w-full">
              Create Assessment
            </DSButton>
          </Link>
          <Link to="/app/insights/class" className="flex-1">
            <DSButton size="sm" className="w-full">
              View All Insights
            </DSButton>
          </Link>
        </DSFlexContainer>
      </DSCardContent>
    </DSCard>
  );
};

export default AnalyticsDashboard;
