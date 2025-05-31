
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-heading-sm text-gray-600">{title}</CardTitle>
          {icon && (
            <div className="text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-display-md font-bold text-semantic-primary">
          {value}
        </div>
        {trend && (
          <p className={`text-body-sm mt-1 ${
            trend.isPositive ? 'text-semantic-success' : 'text-semantic-danger'
          }`}>
            {trend.value}
          </p>
        )}
        {description && (
          <p className="text-help mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardGridProps {
  stats?: React.ReactNode;
  mainContent: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  stats,
  mainContent,
  sidebar,
  className = ''
}) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Stats Section */}
      {stats && (
        <div className="grid-cards">
          {stats}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid-dashboard">
        <div className="lg:col-span-2 content-spacing">
          {mainContent}
        </div>
        {sidebar && (
          <div className="content-spacing">
            {sidebar}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardGrid;
