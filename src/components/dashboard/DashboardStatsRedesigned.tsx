
import React from 'react';
import { Users, FileText, Lightbulb, TrendingUp } from 'lucide-react';
import { 
  DSCard,
  DSCardContent,
  DSContentGrid
} from '@/components/ui/design-system';
import { MetricDisplay, StatusBadge } from '@/components/ui/design-system-enhanced';
import { transitionClasses } from '@/components/ui/transitions';
import { semanticColors } from '@/components/ui/design-system-colors';

interface StatsData {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  variant: 'primary' | 'success' | 'warning' | 'danger';
}

interface DashboardStatsRedesignedProps {
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

const DashboardStatsRedesigned: React.FC<DashboardStatsRedesignedProps> = ({
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
      icon: <Users className="h-6 w-6" />,
      trend: newStudentsThisMonth > 0 ? `+${newStudentsThisMonth} this month` : "No new students",
      variant: 'primary'
    },
    {
      title: "Assessments",
      value: totalAssessments.toString(),
      icon: <FileText className="h-6 w-6" />,
      trend: recentAssessments > 0 ? `+${recentAssessments} this week` : "No recent assessments",
      variant: 'success'
    },
    {
      title: "AI Insights Generated",
      value: aiInsights.toString(),
      icon: <Lightbulb className="h-6 w-6" />,
      trend: todaysInsights > 0 ? `+${todaysInsights} today` : "No new insights",
      variant: 'warning'
    },
    {
      title: "Avg. Class Performance",
      value: studentMetrics?.averagePerformance || "N/A",
      icon: <TrendingUp className="h-6 w-6" />,
      trend: studentMetrics?.averagePerformance !== "N/A" ? "Based on latest data" : "No data available",
      variant: 'danger'
    }
  ];

  return (
    <DSContentGrid cols={4} className="gap-6">
      {stats.map((stat, index) => (
        <DSCard key={index} className={transitionClasses.hover}>
          <DSCardContent className="p-6">
            <MetricDisplay
              label={stat.title}
              value={stat.value}
              icon={stat.icon}
              variant={stat.variant}
              trend={{
                value: stat.trend,
                direction: stat.trend.includes('+') ? 'up' : 'neutral'
              }}
            />
          </DSCardContent>
        </DSCard>
      ))}
    </DSContentGrid>
  );
};

export default DashboardStatsRedesigned;
