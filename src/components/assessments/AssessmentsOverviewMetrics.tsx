
import React from 'react';
import { FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessment-service';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </Card>
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
      color: 'blue',
      sparkline: [20, 25, 30, 28, 35, 40, 45],
      status: 'Active'
    },
    {
      title: 'Completed',
      value: metrics.completed,
      icon: CheckCircle,
      trend: { value: '+8%', positive: true },
      color: 'green',
      sparkline: [15, 18, 22, 25, 28, 30, 35],
      status: 'Completed'
    },
    {
      title: 'Draft',
      value: metrics.drafts,
      icon: Clock,
      trend: { value: '-3%', positive: false },
      color: 'amber',
      sparkline: [10, 8, 6, 4, 3, 2, 1],
      status: 'Pending'
    },
    {
      title: 'Avg. Score',
      value: `${metrics.averageScore}%`,
      icon: TrendingUp,
      trend: { value: '+5%', positive: true },
      color: 'purple',
      sparkline: [65, 70, 68, 75, 78, 80, 85],
      status: 'Good'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        const colorClasses = {
          blue: {
            border: 'border-l-blue-500',
            bg: 'from-blue-50/80 to-blue-100/50',
            icon: 'bg-blue-100 text-blue-600',
            sparkline: 'bg-blue-200',
            badge: 'bg-blue-50 text-blue-700 border-blue-200'
          },
          green: {
            border: 'border-l-green-500',
            bg: 'from-green-50/80 to-green-100/50',
            icon: 'bg-green-100 text-green-600',
            sparkline: 'bg-green-200',
            badge: 'bg-green-50 text-green-700 border-green-200'
          },
          amber: {
            border: 'border-l-amber-500',
            bg: 'from-amber-50/80 to-amber-100/50',
            icon: 'bg-amber-100 text-amber-600',
            sparkline: 'bg-amber-200',
            badge: 'bg-amber-50 text-amber-700 border-amber-200'
          },
          purple: {
            border: 'border-l-purple-500',
            bg: 'from-purple-50/80 to-purple-100/50',
            icon: 'bg-purple-100 text-purple-600',
            sparkline: 'bg-purple-200',
            badge: 'bg-purple-50 text-purple-700 border-purple-200'
          }
        };
        
        const colors = colorClasses[metric.color as keyof typeof colorClasses];

        return (
          <Card
            key={index}
            className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 group border-l-4 ${colors.border} bg-gradient-to-br ${colors.bg}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${colors.icon}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={metric.trend.positive ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {metric.trend.value}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`text-xs border ${colors.badge}`}
                  >
                    {metric.status}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-1 mb-4">
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.title}</p>
              </div>

              {/* Mini Sparkline */}
              <div className="h-8 flex items-end space-x-1">
                {metric.sparkline.map((value, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-sm opacity-60 group-hover:opacity-100 transition-opacity ${colors.sparkline}`}
                    style={{ height: `${(value / Math.max(...metric.sparkline)) * 100}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AssessmentsOverviewMetrics;
