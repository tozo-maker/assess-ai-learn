
import React from 'react';
import { TrendingUp, TrendingDown, Users, FileText, Lightbulb } from 'lucide-react';
import {
  DSContentGrid,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSHelpText,
  designSystem
} from '@/components/ui/design-system';

interface DashboardMetricCardsProps {
  metrics: {
    totalStudents: number;
    totalAssessments: number;
    aiInsights: number;
    recentAssessments: number;
    averagePerformance: string;
    studentsNeedingAttention: number;
  };
}

const DashboardMetricCards: React.FC<DashboardMetricCardsProps> = ({ metrics }) => {
  const metricCards = [
    {
      title: 'Total Students',
      value: metrics.totalStudents.toString(),
      icon: <Users className={`h-5 w-5 ${designSystem.colors.primary.text}`} />,
      trend: {
        value: '+2 this month',
        isPositive: true
      }
    },
    {
      title: 'Assessments',
      value: metrics.totalAssessments.toString(),
      icon: <FileText className={`h-5 w-5 ${designSystem.colors.success.text}`} />,
      trend: {
        value: `${metrics.recentAssessments} this week`,
        isPositive: metrics.recentAssessments > 0
      }
    },
    {
      title: 'AI Insights',
      value: metrics.aiInsights.toString(),
      icon: <Lightbulb className={`h-5 w-5 ${designSystem.colors.warning.text}`} />,
      trend: {
        value: 'Up to date',
        isPositive: true
      }
    }
  ];

  return (
    <DSContentGrid cols={3}>
      {metricCards.map((card, index) => (
        <DSCard key={index} className="h-full">
          <DSCardHeader className="pb-3">
            <DSFlexContainer justify="between" align="center">
              <DSCardTitle className="text-sm text-gray-500 font-medium">
                {card.title}
              </DSCardTitle>
              {card.icon}
            </DSFlexContainer>
          </DSCardHeader>
          <DSCardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {card.value}
            </div>
            <DSFlexContainer align="center" gap="xs">
              {card.trend.isPositive ? (
                <TrendingUp className={`h-4 w-4 ${designSystem.colors.success.text}`} />
              ) : (
                <TrendingDown className={`h-4 w-4 ${designSystem.colors.danger.text}`} />
              )}
              <DSHelpText className={`${
                card.trend.isPositive ? designSystem.colors.success.text : designSystem.colors.danger.text
              }`}>
                {card.trend.value}
              </DSHelpText>
            </DSFlexContainer>
          </DSCardContent>
        </DSCard>
      ))}
    </DSContentGrid>
  );
};

export default DashboardMetricCards;
