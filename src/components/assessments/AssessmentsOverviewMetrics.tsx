
import React from 'react';
import { FileText, TrendingUp, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessment-service';
import { DSCard, DSCardContent, DSContentGrid, DSFlexContainer, DSStatusBadge } from '@/components/ui/design-system';

const AssessmentsOverviewMetrics: React.FC = () => {
  const { data: assessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: assessmentService.getAssessments,
  });

  const metrics = React.useMemo(() => {
    if (!assessments) return null;

    const totalAssessments = assessments.length;
    const completedAssessments = assessments.filter(a => !a.is_draft).length;
    const draftAssessments = assessments.filter(a => a.is_draft).length;
    const averageScore = assessments
      .filter(a => a.max_score)
      .reduce((acc, a) => acc + (a.max_score || 0), 0) / assessments.filter(a => a.max_score).length || 0;

    return {
      total: totalAssessments,
      completed: completedAssessments,
      drafts: draftAssessments,
      averageScore: Math.round(averageScore),
      completionRate: totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0
    };
  }, [assessments]);

  if (!metrics) {
    return (
      <DSContentGrid cols={4} className="mb-8">
        {[...Array(4)].map((_, i) => (
          <DSCard key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </DSCard>
        ))}
      </DSContentGrid>
    );
  }

  const metricCards = [
    {
      title: 'Total Assessments',
      value: metrics.total,
      icon: FileText,
      trend: { value: '+12%', positive: true },
      color: 'primary',
      sparkline: [20, 25, 30, 28, 35, 40, 45]
    },
    {
      title: 'Completed',
      value: metrics.completed,
      icon: CheckCircle,
      trend: { value: '+8%', positive: true },
      color: 'success',
      sparkline: [15, 18, 22, 25, 28, 30, 35]
    },
    {
      title: 'Draft',
      value: metrics.drafts,
      icon: Clock,
      trend: { value: '-3%', positive: false },
      color: 'warning',
      sparkline: [10, 8, 6, 4, 3, 2, 1]
    },
    {
      title: 'Avg. Score',
      value: `${metrics.averageScore}%`,
      icon: TrendingUp,
      trend: { value: '+5%', positive: true },
      color: 'info',
      sparkline: [65, 70, 68, 75, 78, 80, 85]
    }
  ];

  return (
    <DSContentGrid cols={4} className="mb-8">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <DSCard
            key={index}
            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            <DSCardContent className="p-6">
              <DSFlexContainer direction="row" justify="between" align="center" className="mb-4">
                <div className={`p-2 rounded-lg ${
                  metric.color === 'primary' ? 'bg-blue-50' :
                  metric.color === 'success' ? 'bg-green-50' :
                  metric.color === 'warning' ? 'bg-amber-50' :
                  'bg-purple-50'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    metric.color === 'primary' ? 'text-blue-600' :
                    metric.color === 'success' ? 'text-green-600' :
                    metric.color === 'warning' ? 'text-amber-600' :
                    'text-purple-600'
                  }`} />
                </div>
                <DSStatusBadge 
                  variant={metric.trend.positive ? 'success' : 'danger'}
                  size="sm"
                >
                  {metric.trend.value}
                </DSStatusBadge>
              </DSFlexContainer>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.title}</p>
              </div>

              {/* Mini Sparkline */}
              <div className="mt-4 h-8 flex items-end space-x-1">
                {metric.sparkline.map((value, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-sm opacity-60 group-hover:opacity-100 transition-opacity ${
                      metric.color === 'primary' ? 'bg-blue-200' :
                      metric.color === 'success' ? 'bg-green-200' :
                      metric.color === 'warning' ? 'bg-amber-200' :
                      'bg-purple-200'
                    }`}
                    style={{ height: `${(value / Math.max(...metric.sparkline)) * 100}%` }}
                  />
                ))}
              </div>
            </DSCardContent>
          </DSCard>
        );
      })}
    </DSContentGrid>
  );
};

export default AssessmentsOverviewMetrics;
