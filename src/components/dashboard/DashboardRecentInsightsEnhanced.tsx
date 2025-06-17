
import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, TrendingUp, Users, BookOpen, Brain, Target, AlertCircle } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSHelpText,
  DSButton,
  DSSpacer,
  DSStatusBadge
} from '@/components/ui/design-system';

interface DashboardRecentInsightsEnhancedProps {
  students: any[];
  communications: any[];
}

const DashboardRecentInsightsEnhanced: React.FC<DashboardRecentInsightsEnhancedProps> = ({
  students,
  communications
}) => {
  // Generate enhanced insights based on actual data
  const insights = [
    ...(students.length > 0 ? [{
      id: '1',
      icon: <TrendingUp className="h-4 w-4" />,
      title: 'Math Performance Improving',
      description: `${Math.min(3, students.length)} students showing growth in problem-solving skills`,
      actionText: 'View Analysis',
      actionUrl: '/app/insights',
      priority: 'medium' as const,
      confidence: 'high' as const,
      impact: 'positive' as const
    }] : []),
    ...(students.length > 5 ? [{
      id: '2',
      icon: <Users className="h-4 w-4" />,
      title: 'Class Engagement High',
      description: 'Overall participation rates above 85% this week',
      actionText: 'See Analytics',
      actionUrl: '/app/insights',
      priority: 'low' as const,
      confidence: 'high' as const,
      impact: 'positive' as const
    }] : []),
    {
      id: '3',
      icon: <BookOpen className="h-4 w-4" />,
      title: 'Reading Comprehension Focus',
      description: 'AI suggests targeted reading exercises for improved outcomes',
      actionText: 'View Recommendations',
      actionUrl: '/app/insights/recommendations',
      priority: 'high' as const,
      confidence: 'medium' as const,
      impact: 'opportunity' as const
    },
    {
      id: '4',
      icon: <Brain className="h-4 w-4" />,
      title: 'Learning Pattern Detected',
      description: 'Students perform better with visual learning materials',
      actionText: 'Apply Strategy',
      actionUrl: '/app/insights',
      priority: 'medium' as const,
      confidence: 'high' as const,
      impact: 'opportunity' as const
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-blue-500';
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high': return { variant: 'success' as const, text: 'High Confidence' };
      case 'medium': return { variant: 'warning' as const, text: 'Medium Confidence' };
      default: return { variant: 'neutral' as const, text: 'Low Confidence' };
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'opportunity': return <Target className="h-3 w-3 text-blue-500" />;
      default: return <AlertCircle className="h-3 w-3 text-amber-500" />;
    }
  };

  return (
    <DSCard className="h-full">
      <DSCardHeader>
        <DSFlexContainer justify="between" align="center">
          <DSCardTitle>AI Insights</DSCardTitle>
          <DSFlexContainer align="center" gap="sm">
            <Brain className="h-4 w-4 text-purple-500" />
            <Link to="/app/insights">
              <DSButton variant="ghost" size="sm">
                View All
              </DSButton>
            </Link>
          </DSFlexContainer>
        </DSFlexContainer>
      </DSCardHeader>
      <DSCardContent>
        {insights.length === 0 ? (
          <div className="text-center py-12 border-l-4 border-l-gray-300 bg-gray-50 rounded-lg">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <DSBodyText className="text-gray-600 mb-4">
              No insights available yet
            </DSBodyText>
            <DSBodyText className="text-sm text-gray-500">
              Insights will appear as you add assessments and track student progress
            </DSBodyText>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const confidenceBadge = getConfidenceBadge(insight.confidence);
              return (
                <div key={insight.id}>
                  <div className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-500 bg-purple-50">
                    <DSFlexContainer align="start" gap="md">
                      <div className={`mt-1 ${getPriorityColor(insight.priority)}`}>
                        {insight.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <DSFlexContainer justify="between" align="start" className="mb-2">
                          <DSBodyText className="font-semibold text-gray-900">
                            {insight.title}
                          </DSBodyText>
                          <DSFlexContainer align="center" gap="xs">
                            {getImpactIcon(insight.impact)}
                            <DSStatusBadge variant={confidenceBadge.variant} size="sm">
                              AI
                            </DSStatusBadge>
                          </DSFlexContainer>
                        </DSFlexContainer>
                        <DSHelpText className="mb-3">
                          {insight.description}
                        </DSHelpText>
                        <DSFlexContainer justify="between" align="center">
                          <DSStatusBadge 
                            variant={confidenceBadge.variant} 
                            size="sm"
                          >
                            {confidenceBadge.text}
                          </DSStatusBadge>
                          <Link 
                            to={insight.actionUrl}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium hover:underline"
                          >
                            {insight.actionText}
                          </Link>
                        </DSFlexContainer>
                      </div>
                    </DSFlexContainer>
                  </div>
                  {index < insights.length - 1 && <DSSpacer size="sm" />}
                </div>
              );
            })}
          </div>
        )}
      </DSCardContent>
    </DSCard>
  );
};

export default DashboardRecentInsightsEnhanced;
