
import React from 'react';
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EnhancedWelcomeSectionProps {
  teacher: {
    full_name?: string;
    firstName?: string;
  };
  contextualInfo?: {
    totalStudents: number;
    activeAssessments: number;
    upcomingDeadlines: number;
    recentInsights: number;
  };
}

const EnhancedWelcomeSection: React.FC<EnhancedWelcomeSectionProps> = ({
  teacher,
  contextualInfo
}) => {
  const currentDate = new Date();
  const timeOfDay = currentDate.getHours() < 12 ? 'morning' : 
                   currentDate.getHours() < 17 ? 'afternoon' : 'evening';
  
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const firstName = teacher?.firstName || teacher?.full_name?.split(' ')[0] || 'Teacher';

  const getGreeting = () => {
    const greetings = {
      morning: `Good morning, ${firstName}! ☀️`,
      afternoon: `Good afternoon, ${firstName}! 🌤️`,
      evening: `Good evening, ${firstName}! 🌙`
    };
    return greetings[timeOfDay];
  };

  const contextualInsights = [
    {
      icon: Users,
      label: 'Active Students',
      value: contextualInfo?.totalStudents || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      icon: TrendingUp,
      label: 'New Insights',
      value: contextualInfo?.recentInsights || 0,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    {
      icon: Clock,
      label: 'Pending Items',
      value: contextualInfo?.upcomingDeadlines || 0,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20'
    }
  ];

  return (
    <Card className="bg-gradient-to-r from-primary/5 via-primary/3 to-primary/5 border-primary/20 interactive-card">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Welcome Message */}
          <div className="space-y-3">
            <div>
              <h1 className="text-hierarchy-1 mb-2 animate-fade-in">
                {getGreeting()}
              </h1>
              <div className="flex items-center gap-3 text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <time 
                    dateTime={currentDate.toISOString().split('T')[0]}
                    className="font-medium"
                  >
                    {formattedDate}
                  </time>
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  Dashboard Overview
                </Badge>
              </div>
            </div>
            
            <p className="text-body-primary max-w-2xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Here's your educational insights dashboard. Track student progress, 
              review AI-powered recommendations, and manage your classroom effectively.
            </p>
          </div>

          {/* Contextual Quick Stats */}
          {contextualInfo && (
            <div className="flex flex-wrap lg:flex-col gap-4 lg:gap-3">
              {contextualInsights.map((insight, index) => (
                <div
                  key={index}
                  className={cn(
                    "stagger-item flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 backdrop-blur-sm min-w-[140px] transition-all duration-200 hover:shadow-md focus-enhanced",
                    insight.bgColor
                  )}
                  style={{ animationDelay: `${0.6 + (index * 0.1)}s` }}
                  role="group"
                  aria-label={`${insight.label}: ${insight.value}`}
                >
                  <div className={cn("p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm", insight.color)}>
                    <insight.icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-hierarchy-3">
                      {insight.value}
                    </div>
                    <div className="text-caption">
                      {insight.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedWelcomeSection;
