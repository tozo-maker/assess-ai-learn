
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
  DSContentGrid
} from '@/components/ui/design-system';
import { MetricDisplay, StatusBadge, InteractiveCard } from '@/components/ui/design-system-enhanced';
import { semanticColors } from '@/components/ui/design-system-colors';
import { transitionClasses } from '@/components/ui/transitions';

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

  return (
    <DSCard className={className}>
      <DSCardHeader>
        <DSCardTitle>
          <DSFlexContainer justify="between" align="center">
            <DSFlexContainer align="center" gap="sm">
              <TrendingUp className={`h-5 w-5 ${semanticColors.primary.text}`} />
              <span>Class Analytics Overview</span>
            </DSFlexContainer>
            <StatusBadge variant={performanceBadge.variant}>
              {performanceBadge.label}
            </StatusBadge>
          </DSFlexContainer>
        </DSCardTitle>
      </DSCardHeader>
      <DSCardContent className="space-y-8">
        {/* Key Metrics Grid */}
        <DSContentGrid cols={4} className="gap-4">
          {keyMetrics.map((metric, index) => (
            <div key={index} className={`text-center p-4 ${semanticColors[metric.variant].light} rounded-lg`}>
              <div className={`${semanticColors[metric.variant].text} mx-auto mb-2`}>
                {metric.icon}
              </div>
              <MetricDisplay
                label={metric.label}
                value={metric.value}
                variant={metric.variant}
                className="text-center"
              />
            </div>
          ))}
        </DSContentGrid>

        {/* Performance Insights */}
        <DSContentGrid cols={2} className="gap-6">
          <InteractiveCard>
            <DSFlexContainer justify="between" align="center" className="mb-4">
              <h4 className="font-medium text-gray-900">Students at Risk</h4>
              <AlertTriangle className={`h-4 w-4 ${semanticColors.danger.text}`} />
            </DSFlexContainer>
            <MetricDisplay
              label="Need immediate attention"
              value={data.studentsAtRisk}
              variant="danger"
            />
            <DSSpacer size="md" />
            <Link to="/app/students">
              <DSButton variant="secondary" size="sm" className="w-full">
                View Details
              </DSButton>
            </Link>
          </InteractiveCard>

          <InteractiveCard>
            <DSFlexContainer justify="between" align="center" className="mb-4">
              <h4 className="font-medium text-gray-900">High Performers</h4>
              <CheckCircle className={`h-4 w-4 ${semanticColors.success.text}`} />
            </DSFlexContainer>
            <MetricDisplay
              label="Exceeding expectations"
              value={data.studentsExcelling}
              variant="success"
            />
            <DSSpacer size="md" />
            <Link to="/app/insights/class">
              <DSButton variant="secondary" size="sm" className="w-full">
                View Insights
              </DSButton>
            </Link>
          </InteractiveCard>
        </DSContentGrid>

        {/* Growth Indicator */}
        <div className={`p-6 bg-gradient-to-r from-${semanticColors.primary.light} to-${semanticColors.info.light} rounded-lg`}>
          <DSFlexContainer justify="between" align="center">
            <div>
              <h4 className="font-medium text-gray-900">Recent Growth</h4>
              <DSBodyText className="text-gray-600">Compared to last month</DSBodyText>
            </div>
            <DSFlexContainer align="center" gap="sm">
              {data.recentGrowth > 0 ? (
                <TrendingUp className={`h-5 w-5 ${semanticColors.success.text}`} />
              ) : (
                <TrendingDown className={`h-5 w-5 ${semanticColors.danger.text}`} />
              )}
              <span className={`text-lg font-bold ${data.recentGrowth > 0 ? semanticColors.success.text : semanticColors.danger.text}`}>
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
