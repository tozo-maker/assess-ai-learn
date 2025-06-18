
import React from 'react';
import { FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessment-service';

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
      averageScore: Math.round(averageScore)
    };
  }, [assessments]);

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Assessments',
      value: metrics.total,
      icon: FileText,
      trend: { value: '+12%', positive: true },
      color: 'blue'
    },
    {
      title: 'Completed',
      value: metrics.completed,
      icon: CheckCircle,
      trend: { value: '+8%', positive: true },
      color: 'green'
    },
    {
      title: 'Draft',
      value: metrics.drafts,
      icon: Clock,
      trend: { value: '-3%', positive: false },
      color: 'amber'
    },
    {
      title: 'Avg. Max Score',
      value: metrics.averageScore,
      icon: TrendingUp,
      trend: { value: '+5%', positive: true },
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-${metric.color}-50`}>
                <Icon className={`h-5 w-5 text-${metric.color}-600`} />
              </div>
              <span className={`text-sm font-medium ${
                metric.trend.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend.value}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-sm text-gray-600">{metric.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AssessmentsOverviewMetrics;
