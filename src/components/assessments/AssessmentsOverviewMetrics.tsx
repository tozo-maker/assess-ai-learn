
import React from 'react';
import { FileText, Target, Clock, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
    period: string;
  };
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600'
  };

  const trendColorClasses = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendColorClasses[change.trend]}`}>
            {change.trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
        {change && (
          <p className="text-xs text-gray-500">vs {change.period}</p>
        )}
      </div>
    </div>
  );
};

const AssessmentsOverviewMetrics: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Assessments"
        value={24}
        change={{ value: 8, trend: 'up', period: 'last month' }}
        icon={<FileText className="h-5 w-5" />}
        color="blue"
      />
      
      <MetricCard
        title="Average Class Score"
        value="78%"
        change={{ value: 3, trend: 'up', period: 'last month' }}
        icon={<Target className="h-5 w-5" />}
        color="green"
      />
      
      <MetricCard
        title="Completion Rate"
        value="92%"
        change={{ value: 5, trend: 'up', period: 'last month' }}
        icon={<CheckCircle className="h-5 w-5" />}
        color="purple"
      />
      
      <MetricCard
        title="Pending Reviews"
        value={7}
        change={{ value: 2, trend: 'down', period: 'last week' }}
        icon={<Clock className="h-5 w-5" />}
        color="amber"
      />
    </div>
  );
};

export default AssessmentsOverviewMetrics;
