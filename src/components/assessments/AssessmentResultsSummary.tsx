
import React from 'react';
import { TrendingUp, Users, Target, AlertCircle } from 'lucide-react';

// Design System Components
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSContentGrid
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
          <DSCard key={index} className="hover:shadow-md transition-shadow duration-300">
            <DSCardContent>
              <DSFlexContainer justify="between" align="center">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <IconComponent className={`h-6 w-6 ${card.color}`} />
                </div>
              </DSFlexContainer>
            </DSCardContent>
          </DSCard>
        );
      })}
    </DSContentGrid>
  );
};

export default AssessmentResultsSummary;
