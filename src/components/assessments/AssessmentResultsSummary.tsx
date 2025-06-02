
import React from 'react';
import { TrendingUp, Users, Target, AlertCircle } from 'lucide-react';

// Design System Components
import {
  DSCard,
  DSCardContent,
  DSFlexContainer,
  DSContentGrid,
  DSGridItem,
  DSBodyText
} from '@/components/ui/design-system';

interface AssessmentResultsSummaryProps {
  totalStudents: number;
  averageScore: number;
  completionRate: number;
  needsAttention: number;
}

const AssessmentResultsSummary: React.FC<AssessmentResultsSummaryProps> = ({
  totalStudents,
  averageScore,
  completionRate,
  needsAttention
}) => {
  const summaryCards = [
    {
      title: 'Average Score',
      value: `${averageScore.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-[#10b981]',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Students',
      value: totalStudents.toString(),
      icon: Users,
      color: 'text-[#2563eb]',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-[#6b7280]',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Needs Attention',
      value: needsAttention.toString(),
      icon: AlertCircle,
      color: 'text-[#ef4444]',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <DSContentGrid cols={4}>
      {summaryCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <DSGridItem key={index} span={1}>
            <DSCard className="hover:shadow-md transition-shadow duration-300">
              <DSCardContent className="p-6">
                <DSFlexContainer justify="between" align="center">
                  <div>
                    <DSBodyText className="text-sm text-gray-600">{card.title}</DSBodyText>
                    <DSBodyText className="text-3xl font-bold text-gray-900 mt-1">{card.value}</DSBodyText>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 ${card.color}`} />
                  </div>
                </DSFlexContainer>
              </DSCardContent>
            </DSCard>
          </DSGridItem>
        );
      })}
    </DSContentGrid>
  );
};

export default AssessmentResultsSummary;
