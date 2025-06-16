
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, Lightbulb, TrendingUp } from 'lucide-react';

interface StatsData {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}

interface DashboardStatsProps {
  totalStudents: number;
  totalAssessments: number;
  aiInsights: number;
  recentAssessments: number;
  newStudentsThisMonth: number;
  todaysInsights: number;
  studentMetrics?: {
    averagePerformance: string;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalStudents,
  totalAssessments,
  aiInsights,
  recentAssessments,
  newStudentsThisMonth,
  todaysInsights,
  studentMetrics
}) => {
  const stats: StatsData[] = [
    {
      title: "Total Students",
      value: totalStudents.toString(),
      icon: <Users className="h-6 w-6 text-blue-600" />,
      trend: newStudentsThisMonth > 0 ? `+${newStudentsThisMonth} this month` : "No new students"
    },
    {
      title: "Assessments",
      value: totalAssessments.toString(),
      icon: <FileText className="h-6 w-6 text-green-600" />,
      trend: recentAssessments > 0 ? `+${recentAssessments} this week` : "No recent assessments"
    },
    {
      title: "AI Insights Generated",
      value: aiInsights.toString(),
      icon: <Lightbulb className="h-6 w-6 text-purple-600" />,
      trend: todaysInsights > 0 ? `+${todaysInsights} today` : "No new insights"
    },
    {
      title: "Avg. Class Performance",
      value: studentMetrics?.averagePerformance || "N/A",
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      trend: studentMetrics?.averagePerformance !== "N/A" ? "Based on latest data" : "No data available"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.trend}</p>
              </div>
              <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
