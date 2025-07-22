
import React from 'react';
import { useStudents } from '@/hooks/useStudents';
import { TrendingUp, TrendingDown, Users, AlertCircle, BookOpen, Calendar } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSContentGrid,
  DSGridItem,
  DSSubsectionHeader,
  DSBodyText,
  DSHelpText,
  DSStatusBadge
} from '@/components/ui/design-system';
import { studentService } from '@/services/student-service';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  sparklineData?: number[];
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  status = 'neutral',
  sparklineData
}) => {
  const statusConfig = {
    success: { bgColor: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600', badge: 'success' as const },
    warning: { bgColor: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', badge: 'warning' as const },
    danger: { bgColor: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600', badge: 'danger' as const },
    info: { bgColor: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', badge: 'info' as const },
    neutral: { bgColor: 'bg-gray-50', iconBg: 'bg-gray-100', iconColor: 'text-gray-600', badge: 'neutral' as const }
  };

  const config = statusConfig[status];

  return (
    <DSCard className={`relative overflow-hidden border-l-4 ${
      status === 'success' ? 'border-l-green-500' :
      status === 'warning' ? 'border-l-amber-500' :
      status === 'danger' ? 'border-l-red-500' :
      status === 'info' ? 'border-l-blue-500' :
      'border-l-gray-300'
    } ${config.bgColor} transition-all duration-200 hover:shadow-md`}>
      <DSCardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${config.iconBg} shadow-sm`}>
            <div className={`${config.iconColor}`}>
              {icon}
            </div>
          </div>
          {status !== 'neutral' && (
            <DSStatusBadge variant={config.badge} size="sm">
              {status === 'warning' ? 'Needs Attention' : 
               status === 'danger' ? 'Critical' : 
               status === 'success' ? 'Excellent' : 'Good'}
            </DSStatusBadge>
          )}
        </div>
        
        <DSHelpText className="mb-2 font-medium tracking-wide uppercase text-xs">
          {title}
        </DSHelpText>
        
        <div className="text-3xl font-bold text-gray-900 mb-3 leading-none">
          {value}
        </div>

        {/* Sparkline visualization */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mb-3 h-8 flex items-end space-x-1">
            {sparklineData.map((point, index) => (
              <div
                key={index}
                className={`flex-1 rounded-sm ${
                  point > 75 ? 'bg-green-300' :
                  point > 50 ? 'bg-blue-300' :
                  point > 25 ? 'bg-amber-300' : 'bg-red-300'
                }`}
                style={{ height: `${Math.max(point, 10)}%` }}
              />
            ))}
          </div>
        )}
        
        {trend && (
          <div className={`flex items-center gap-2 text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
        
        {description && !trend && (
          <DSHelpText className="mt-1 text-xs leading-relaxed">
            {description}
          </DSHelpText>
        )}
      </DSCardContent>
    </DSCard>
  );
};

export const StudentsOverviewMetrics: React.FC = () => {
  const { data: students = [] } = useStudents();

  // Calculate enhanced metrics
  const totalStudents = students.length;
  
  const studentsWithPerformance = students.filter(student => 
    Array.isArray(student.student_performance) && student.student_performance.length > 0
  );
  
  const averageScore = studentsWithPerformance.length > 0
    ? Math.round(
        studentsWithPerformance.reduce((sum, student) => {
          const performance = student.student_performance[0];
          return sum + (performance?.average_score || 0);
        }, 0) / studentsWithPerformance.length
      )
    : 0;

  const studentsNeedingAttention = studentsWithPerformance.filter(student => {
    const performance = student.student_performance[0];
    return performance?.needs_attention;
  }).length;

  const recentAssessments = studentsWithPerformance.reduce((total, student) => {
    const performance = student.student_performance[0];
    return total + (performance?.assessment_count || 0);
  }, 0);

  // Generate sample sparkline data (in real app, this would come from API)
  const generateSparklineData = (baseValue: number) => {
    return Array.from({ length: 7 }, (_, i) => 
      Math.max(10, baseValue + (Math.random() - 0.5) * 20)
    );
  };

  const getPerformanceStatus = () => {
    if (averageScore >= 85) return 'success';
    if (averageScore >= 70) return 'info';
    if (averageScore >= 60) return 'warning';
    return 'danger';
  };

  const getAttentionStatus = () => {
    if (studentsNeedingAttention === 0) return 'success';
    if (studentsNeedingAttention <= 2) return 'warning';
    return 'danger';
  };

  return (
    <div className="mb-8">
      <DSContentGrid cols={4} className="gap-6">
        <DSGridItem span={1}>
          <MetricCard
            title="Total Students"
            value={totalStudents}
            description="Active students in your class"
            icon={<Users className="h-6 w-6" />}
            trend={{
              value: "2 new this month",
              isPositive: true
            }}
            sparklineData={generateSparklineData(80)}
          />
        </DSGridItem>
        
        <DSGridItem span={1}>
          <MetricCard
            title="Class Average"
            value={`${averageScore}%`}
            description="Overall performance score"
            icon={<TrendingUp className="h-6 w-6" />}
            status={getPerformanceStatus()}
            trend={{
              value: "5% from last month",
              isPositive: averageScore >= 75
            }}
            sparklineData={generateSparklineData(averageScore)}
          />
        </DSGridItem>
        
        <DSGridItem span={1}>
          <MetricCard
            title="Need Attention"
            value={studentsNeedingAttention}
            description="Students requiring support"
            icon={<AlertCircle className="h-6 w-6" />}
            status={getAttentionStatus()}
            sparklineData={generateSparklineData(Math.max(10, 100 - studentsNeedingAttention * 10))}
          />
        </DSGridItem>
        
        <DSGridItem span={1}>
          <MetricCard
            title="Total Assessments"
            value={recentAssessments}
            description="Completed this semester"
            icon={<BookOpen className="h-6 w-6" />}
            trend={{
              value: "12 this month",
              isPositive: true
            }}
            sparklineData={generateSparklineData(70)}
          />
        </DSGridItem>
      </DSContentGrid>
    </div>
  );
};

export default StudentsOverviewMetrics;
